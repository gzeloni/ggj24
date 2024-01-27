from base64 import b64encode
import pickle
from datetime import datetime
import graphql_jwt
import graphene
from django.conf import settings
from api.models import UserModel


class UserType(graphene.ObjectType):
    id = graphene.ID()
    username = graphene.String()
    avatar = graphene.String()
    date_joined = graphene.Date()
    # memes = graphene.List('api.schema.MemeType')

    def resolve_avatar(self, info, **kwargs):
        if not self.avatar:
            return
        return b64encode(pickle.loads(self.avatar)).decode('utf-8')


class Query(graphene.ObjectType):
    version = graphene.String()

    def resolve_version(self, info, **kwargs):
        return settings.VERSION


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


class Mutation:
    # access operations
    sign_up = SignUp.Field()
    sign_in = SignIn.Field()
