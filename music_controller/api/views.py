from django.shortcuts import render
from rest_framework import generics, status
from .serializers import RoomSerializer, CreateRoomSerializer,UpdateRoomSerializer
from .models import Room
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse


# Create your views here.
# Allow us to view all the rooms and create rooms
class RoomView(generics.ListAPIView):

    # Want to return all the room objects
    queryset = Room.objects.all()

    # We have the room that tells it how to convert to JSON
    serializer_class = RoomSerializer

class GetRoom(APIView):
    serializer_class = RoomSerializer
    lookup_url_kwarg = 'code'

    def get(self, request, format=None):
        # Looking for anything in the URL that matches "code"
        code = request.GET.get(self.lookup_url_kwarg)
        if code != None:
            # Filter the room objects based on code of which there should only be one
            room = Room.objects.filter(code=code)
            if len(room) > 0:
                # Getting teh data out of the room serializer
                data = RoomSerializer(room[0]).data
                # Here we are checking to see if the users session ID is equal to that of the
                # host ID. if it is then they are the host of the session
                data['is_host'] = self.request.session.session_key == room[0].host
                return Response(data,status = status.HTTP_200_OK)

            return Response({'Room Not Found': 'Invalid Room Code'}, status= status.HTTP_404_NOT_FOUND)

        return Response({"Bad Request": "Code Parameter Not Found In Request"}, status= status.HTTP_400_BAD_REQUEST)



class JoinRoom(APIView):
    lookup_url_kwarg = 'code'

    def post(self, request,format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        #with post requests we can directly use the .data command, get would need request.get.get as seen above
        code = request.data.get(self.lookup_url_kwarg)
        if code != None:
            room_result = Room.objects.filter(code=code)
            # Make sure there are actually rooms available
            if len(room_result) > 0:
                room=room_result[0]
                # this line indicates that if the person leaves they can be returned to there
                # original room once they reload this code will be stored in the users session
                self.request.session['room_code'] = code
                return Response({"Message": "Room Joined!"}, status=status.HTTP_200_OK)

            return Response({"Bad Request": "Invalid Room Code"}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"Bad Request": "Invalid Host Data, Did not find a code key"}, status=status.HTTP_400_BAD_REQUEST)


class CreateRoomView(APIView):
    serializer_class = CreateRoomSerializer

    def post(self, request, format=None):
        # Check if the session already exists,
        # ie. if the user already has a window open or something
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        # This will check if the data that has been sent is correct and validated
        # Against our model
        # will convert the data into something that python can verify
        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            host = self.request.session.session_key


            # If the hosts room already exists just update the information
            queryset = Room.objects.filter(host=host)
            if queryset.exists():
                room = queryset[0]
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                self.request.session['room_code'] = room.code
                room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
                return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)

            # Create the room if one doesnt exist
            else:
                room = Room(host=host,
                            guest_can_pause=guest_can_pause,
                            votes_to_skip=votes_to_skip)
                room.save()
                self.request.session['room_code'] = room.code
                return Response(RoomSerializer(room).data, status= status.HTTP_201_CREATED)
        else:
            return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)

# This refers to an endpoint to see if the user has a key in there session which indicates
# that they belong in a specific room
class UserInRoom(APIView):
    def get(self, request, format = None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        data ={
            'code': self.request.session.get('room_code')
        }
        # This basically takes a python dictionary and returns it in JSON
        return JsonResponse(data, status=status.HTTP_200_OK)

# Remove the user from the room if they are in a room and delete the room if they are the host
class LeaveRoom(APIView):
    def post(self,request,format=None):
        # Remove the room code from the session
        if 'room_code' in self.request.session:
            self.request.session.pop('room_code')
            # Checks if they are hosting the room
            host_id = self.request.session.session_key
            room_results = Room.objects.filter(host=host_id)
            # Removes the session(room) if the host_id is hosting
            if len(room_results) > 0:
                room = room_results[0]
                room.delete()
        return Response({"Message":"Success"}, status= status.HTTP_200_OK)


class UpdateRoom(APIView):
    #Patch is ideally used to update things in the database
    serializer_class = UpdateRoomSerializer

    def patch(self, request, format = None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data = request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause');
            votes_to_skip = serializer.data.get('votes_to_skip');
            code = serializer.data.get('code');

            # We next need to find the room with the code
            querySet = Room.objects.filter(code=code)
            if not querySet.exists(): # same as len(querySet) > 0
                return Response({"msg":"Room Not Found"},status=status.HTTP_404_NOT_FOUND)

            room = querySet[0]
            # next task is to make sure the host is the one editing the room
            user_id = self.request.session.session_key
            if room.host != user_id:
                return Response({"msg": "You Are Not The Host Of The Room"}, status=status.HTTP_403_FORBIDDEN)

            room.guest_can_pause = guest_can_pause
            room.votes_to_skip = votes_to_skip
            room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
            return Response(RoomSerializer(room).data,status=status.HTTP_200_OK)

        return Response({"Bad Request": "Invalid Data"}, status=status.HTTP_400_BAD_REQUEST)

