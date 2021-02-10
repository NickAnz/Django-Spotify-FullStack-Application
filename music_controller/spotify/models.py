from django.db import models
from api.models import Room

# Create your models here.
class SpotifyToken(models.Model):
    user = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    refresh_token = models.CharField(max_length=150, null=True)
    access_token = models.CharField(max_length=150)
    expires_in = models.DateTimeField()
    token_type = models.CharField(max_length=150)

class Vote(models.Model):
    user = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    song_id =models.CharField(max_length=50)
    # Cascade means that any time a vote is removed go through the list and remove all votes relevant to the room
    # If the room is removed then everything is removed
    room = models.ForeignKey(Room, on_delete=models.CASCADE)