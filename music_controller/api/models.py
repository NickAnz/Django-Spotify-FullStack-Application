from django.db import models
import string
import random


# Basic idea is to have fat models and thin views so all the methods for rooms should go in here
# and not in the view


def generate_unique_code():
    length = 6

    while True:
        # generate a random string that is K in length and uses only ascii upper characters
        code = ''.join((random.choices(string.ascii_uppercase, k=length)))
        # Will hunt through all the room objects and count each items that has the same code
        # if there is none with the current code its clear and we can pass it through
        if Room.objects.filter(code=code).count() == 0:
            break
    return code


# Create your models here.
class Room(models.Model):
    # This is the defaults for the field
    code = models.CharField(max_length=8, default=generate_unique_code, unique=True)
    # Unique meaning that one host can only have one room
    host = models.CharField(max_length=50, unique=True)
    # This is a boolean field which says that music can be paused or not
    guest_can_pause = models.BooleanField(null=False, default=False)
    votes_to_skip = models.IntegerField(null=False, default=1)
    # Auto Add means it will get the current date time that the object is created
    # and feed that into the cell
    created_at = models.DateTimeField(auto_now_add=True)
    current_song = models.CharField(max_length=50, null= True)
