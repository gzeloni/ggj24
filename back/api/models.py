from django.db import models
from django.contrib.auth.models import User



class MemeMatch(models.Model):
    hoster = models.ForeignKey('api.UserModel', null=False, on_delete=models.CASCADE, related_name='hoster_user')
    reference = models.CharField(max_length=255, null=False, blank=False)
    datetime_open = models.DateTimeField(null=False)
    datetime_close = models.DateTimeField(null=True)
    is_open = models.BooleanField(default=False)
    participants = models.ManyToManyField('api.UserModel')


class UserModel(User):
    avatar = models.BinaryField(null=True)


class Vote(models.Model):
    user = models.ForeignKey(UserModel, null=False, on_delete=models.CASCADE)
    meme_play = models.ForeignKey('api.MemePlay', null=False, on_delete=models.CASCADE)
    value = models.IntegerField(default=0)


class MemePlay(models.Model):
    meme_match = models.ForeignKey(MemeMatch, null=False, on_delete=models.CASCADE)
    user = models.ForeignKey(UserModel, null=False, on_delete=models.CASCADE)
    meme = models.BinaryField(null=False)
    score = models.FloatField(default=0)

