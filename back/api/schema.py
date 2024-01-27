from base64 import b64encode
import pickle
from datetime import datetime
import graphql_jwt
import graphene
from django.conf import settings
from api.models import UserModel, MemeMatch, MemePlay, Vote
from api.user_auth import access_required


class MatchType(graphene.ObjectType):
    id = graphene.ID()
    reference = graphene.String()
    datetime_open = graphene.DateTime()
    datetime_close = graphene.DateTime()
    is_open = graphene.Boolean()
    memes = graphene.List('api.schema.MemeType')
    hoster = graphene.Field('api.schema.UserType')
    participants = graphene.List('api.schema.UserType')
    participants_count = graphene.Int()

    def resolve_memes(self, info, **kwargs):
        return self.memeplay_set.all()

    def resolve_participants(self, info, **kwargs):
        return self.participants.all()

    def resolve_participants_count(self, info, **kwargs):
        return self.participants.count()


class MemeType(graphene.ObjectType):
    id = graphene.ID()
    meme_match = graphene.Field(MatchType)
    user = graphene.Field('api.schema.UserType')
    meme = graphene.String()
    score = graphene.Float()
    votes = graphene.List('api.schema.VoteType')

    def resolve_meme(self, info, **kwargs):
        return self.meme.decode('utf-8')


class VoteType(graphene.ObjectType):
    user = graphene.Field('api.schema.UserType')
    meme_play = graphene.Field(MemeType)
    value = graphene.Int()


class UserType(graphene.ObjectType):
    id = graphene.ID()
    username = graphene.String()
    avatar = graphene.String()
    date_joined = graphene.Date()
    memes = graphene.List('api.schema.MemeType')

    def resolve_memes(self, info, **kwargs):
        return self.memeplay_set.all()

    def resolve_avatar(self, info, **kwargs):
        if not self.avatar:
            return
        return b64encode(pickle.loads(self.avatar)).decode('utf-8')


class Query(graphene.ObjectType):
    version = graphene.String()

    def resolve_version(self, info, **kwargs):
        return settings.VERSION

    users = graphene.List(
        UserType,
        username__icontains=graphene.String(),
        id__in=graphene.List(graphene.ID)
    )

    def resolve_users(self, info, **kwargs):
        return UserModel.objects.filter(**kwargs)

    user = graphene.Field(
        UserType,
        id=graphene.ID(required=True)
    )

    def resolve_user(self, info, **kwargs):
        return UserModel.objects.get(id=kwargs['id'])

    matches = graphene.List(
        MatchType,
        reference__icontains=graphene.String(),
        is_open=graphene.Boolean(),
        datetime_open=graphene.DateTime(),
        datetime_close=graphene.DateTime(),
        datetime_open__gte=graphene.DateTime(),
        datetime_open__lte=graphene.DateTime()
    )

    def resolve_matches(self, info, **kwargs):
        return MemeMatch.objects.filter(**kwargs)

    memes = graphene.List(
        MemeType,
        meme_match_id=graphene.ID(required=True)
    )

    def resolve_memes(self, info, **kwargs):
        return MemePlay.objects.filter(**kwargs)


############################
#
# Mutation
#
############################


class SignUp(graphene.relay.ClientIDMutation):
    user = graphene.Field(UserType)

    class Input:
        username = graphene.String(required=True)
        email = graphene.String(required=True)
        password = graphene.String(required=True)

    def mutate_and_get_payload(self, info, **kwargs):
        # Check if username or email already exists
        try:
            UserModel.objects.get(username=kwargs['username'])
        except UserModel.DoesNotExist:
            pass
        else:
            raise Exception('Username already in use')

        try:
            UserModel.objects.get(email=kwargs['email'])
        except UserModel.DoesNotExist:
            pass
        else:
            raise Exception('Email already in use')


        # Create user object
        user = UserModel.objects.create(
            username=kwargs['username'],
            email=kwargs['email'],
        )
        user.set_password(kwargs['password'])
        user.save()

        return SignUp(user)


class SignIn(graphene.relay.ClientIDMutation):
    token = graphene.String()

    class Input:
        email = graphene.String(required=True)
        password = graphene.String(required=True)

    def mutate_and_get_payload(self, info, **kwargs):
        try:
            user = UserModel.objects.get(
                email=kwargs['email']
            )
        except UserModel.DoesNotExist:
            raise Exception('User not found')

        if not user.check_password(kwargs['password']):
            raise Exception('Invalid password')

        user.last_login = datetime.now()
        user.save()

        session = graphql_jwt.ObtainJSONWebToken.mutate(
            self,
            info,
            username=user.username,
            email=user.email,
            password=kwargs['password']
        )

        return SignIn(session.token)


class CreateMatch(graphene.relay.ClientIDMutation):
    meme_match = graphene.Field(MatchType)

    class Input:
        reference = graphene.String(required=True)
        datetime_open = graphene.DateTime(required=True)        

    @access_required
    def mutate_and_get_payload(self, info, **kwargs):
        user = kwargs.get('user')
        if not user:
            raise Exception('[AUTH ERROR] Invalid anonymous request')

        game_match = MemeMatch.objects.create(
            reference=kwargs['reference'],
            datetime_open=kwargs['datetime_open'],
            hoster=user
        )
        game_match.save()

        return CreateMatch(game_match)


class StartMatch(graphene.relay.ClientIDMutation):
    meme_match = graphene.Field(MatchType)

    class Input:
        match_id = graphene.ID(required=True)

    @access_required
    def mutate_and_get_payload(self, info, **kwargs):
        user = kwargs.get('user')
        if not user:
            raise Exception('[AUTH ERROR] Invalid anonymous request')

        try:
            game_match = MemeMatch.objects.get(id=kwargs['match_id'])
        except MemeMatch.DoesNotExist:
            raise Exception('[Query Error] Requested object does not exist')

        # Validate ownability and capability of object manipulation
        if user.id != game_match.hoster.id:
            raise Exception('[AUTH ERROR] Unauthorized')

        if game_match.datetime_close is not None:
            raise Exception('[OPERATION ERROR] Cannot reopen a closed match')

        game_match.is_open = True
        game_match.save()

        return StartMatch(game_match)


class CloseMatch(graphene.relay.ClientIDMutation):
    meme_match = graphene.Field(MatchType)

    class Input:
        match_id = graphene.ID(required=True)

    @access_required
    def mutate_and_get_payload(self, info, **kwargs):
        user = kwargs.get('user')
        if not user:
            raise Exception('[AUTH ERROR] Invalid anonymous request')

        try:
            game_match = MemeMatch.objects.get(id=kwargs['match_id'])
        except MemeMatch.DoesNotExist:
            raise Exception('[Query Error] Requested object does not exist')

        # Validate ownability and capability of object manipulation
        if user.id != game_match.hoster.id:
            raise Exception('[AUTH ERROR] Unauthorized')

        if game_match.datetime_close is not None:
            raise Exception('[OPERATION ERROR] Matrch already closed')

        game_match.is_open = False
        game_match.datetime_close = datetime.now()
        game_match.save()

        return CloseMatch(game_match)


class EnterMatch(graphene.relay.ClientIDMutation):
    meme_match = graphene.Field(MatchType)

    class Input:
        match_id = graphene.ID(required=True)

    @access_required
    def mutate_and_get_payload(self, info, **kwargs):
        user = kwargs.get('user')
        if not user:
            raise Exception('[AUTH ERROR] Invalid anonymous request')

        try:
            game_match = MemeMatch.objects.get(id=kwargs['match_id'])
        except MemeMatch.DoesNotExist:
            raise Exception('[Query Error] Requested object does not exist')

        if game_match.datetime_close is not None:
            raise Exception('[OPERATION ERROR] Match already closed')

        if user in game_match.participants.all():
            raise Exception('[OPERATION ERROR] Already registered for this match')

        game_match.participants.add(user)
        game_match.save()

        return EnterMatch(game_match)


class SendMeme(graphene.relay.ClientIDMutation):
    meme = graphene.Field(MemeType)

    class Input:
        match_id = graphene.ID(required=True)
        data = graphene.String(required=True)

    @access_required
    def mutate_and_get_payload(self, info, **kwargs):
        user = kwargs.get('user')
        if not user:
            raise Exception('[AUTH ERROR] Invalid anonymous request')
        
        try:
            game_match = MemeMatch.objects.get(id=kwargs['match_id'])
        except MemeMatch.DoesNotExist:
            raise Exception('[Query Error] Requested object does not exist')

        if game_match.datetime_close is not None:
            raise Exception('[OPERATION ERROR] Match already closed')

        if user not in game_match.participants.all():
            raise Exception('[OPERATION ERROR] Must be registered to the match to send meme')

        if game_match.memeplay_set.filter(user__id=user.id).count() > 0:
            raise Exception('[OPERATION ERROR] Already sent meme for this match')

        meme_play = MemePlay.objects.create(
            meme_match=game_match,
            user=user,
            meme=kwargs['data'].encode('utf-8')
        )
        meme_play.save()

        return SendMeme(meme_play)


class VoteMeme(graphene.relay.ClientIDMutation):
    meme = graphene.Field(MemeType)

    class Input:
        meme_id = graphene.ID(required=True)
        value = graphene.Int(required=True)

    @access_required
    def mutate_and_get_payload(self, info, **kwargs):
        user = kwargs.get('user')
        if not user:
            raise Exception('[AUTH ERROR] Invalid anonymous request')

        try:
            target_meme = MemePlay.objects.get(id=kwargs['meme_id'])
        except MemePlay.DoesNotExist:
            raise Exception('[QUERY ERROR] Request object does not exist')

        # validate votability
        if target_meme.meme_match.datetime_close is not None:
            raise Exception('[OPERATION ERROR] Match already closed')

        if target_meme.user.id == user.id:
            raise Exception('[OPERATION ERROR] Cannot vote on self posted meme')

        if target_meme.vote_set.filter(user__id=user.id).count() > 0:
            raise Exception('[OPERATION ERROR] Already voted in this meme')

        # validate given value
        if kwargs['value'] < 0 or kwargs['value'] > 10:
            raise Exception('[VALUE ERROR] Vote value must be between 0 and 10')

        vote = Vote.objects.create(
            user=user,
            meme_play=target_meme,
            value=kwargs['value']
        )
        vote.save()

        target_meme.score = sum([i.value for i in target_meme.votes.all()]) / target_meme.votes.count()
        target_meme.save()

        return VoteMeme(target_meme)


class Mutation:
    # access operations
    sign_up = SignUp.Field()
    sign_in = SignIn.Field()

    # matches
    create_match = CreateMatch.Field()
    start_match = CreateMatch.Field()
    close_match = CreateMatch.Field()
    enter_match = EnterMatch.Field()

    # meme
    send_meme = SendMeme.Field()
    vote_meme = VoteMeme.Field()
