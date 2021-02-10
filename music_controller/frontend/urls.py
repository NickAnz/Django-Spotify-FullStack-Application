from django.urls import path, include
from .views import index

# used for the spotify redirect
app_name = 'frontend'

urlpatterns = [
    path('', index, name =''),
    path('join', index),
    path('create', index),
    path('room/<str:roomCode>',index)
]
