from django.db import models
from django.contrib.auth.models import User





class UserModel(User):
    avatar = models.BinaryField(null=True)

