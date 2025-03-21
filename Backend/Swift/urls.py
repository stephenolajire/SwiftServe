from django.urls import path
from .views import *

urlpatterns = [
    path('deliveries/', DeliveryListCreateView.as_view(), name='delivery-list-create'),
]