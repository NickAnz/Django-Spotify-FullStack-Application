# This content will convert the python model into a JSON response
from rest_framework import serializers
from .models import Room


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ('id', 'code', 'host', 'guest_can_pause', 'votes_to_skip', 'created_at')

# POST Request
# class Meta means anything that is a field within the database
# Anything that is not in this meta is in the CreateRoomSelializer class above


class CreateRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ('guest_can_pause', 'votes_to_skip')


class UpdateRoomSerializer(serializers.ModelSerializer):
    # The basic idea here is that we cannot serialize a unique field so in order to still get the code
    # We redefine 'code' so that it is not unique and we can use it to patch
    code = serializers.CharField(validators=[])

    class Meta:
        model = Room
        fields = ('guest_can_pause', 'votes_to_skip', 'code')