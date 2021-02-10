from django.contrib import admin
from django.urls import path, include
from .views import RoomView
from .views import CreateRoomView
from .views import GetRoom
from .views import JoinRoom
from .views import UserInRoom
from .views import LeaveRoom
from .views import UpdateRoom

urlpatterns = [
    path('room', RoomView.as_view()),
    path('create-room', CreateRoomView.as_view()),
    path('get-room', GetRoom.as_view()),
    path('join-room', JoinRoom.as_view()),
    path('user-in-room',UserInRoom.as_view()),
    path('leave-room',LeaveRoom.as_view()),
    path('update-room',UpdateRoom.as_view())
]
