from django.urls import path
from .views import *

urlpatterns = [
    path('deliveries/', DeliveryListCreateView.as_view(), name='delivery-list-create'),
    path('user/profile/', GetUserView.as_view(), name='user-profile'),
]