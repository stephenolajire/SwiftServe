from django.urls import path
from .views import *

urlpatterns = [
    path('user/profile/', GetUserView.as_view(), name='user-profile'),
]