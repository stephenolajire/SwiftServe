from django.urls import path
from .views import *
from .views import AcceptDeliveryView, WorkerDeliveryView, UpdateDeliveryStatusView, ChatMessageView

urlpatterns = [
    path('deliveries/', DeliveryListCreateView.as_view(), name='delivery-list-create'),
    path('deliveries/<int:delivery_id>/accept/', AcceptDeliveryView.as_view(), name='accept-delivery'),
    path('deliveries/worker/', WorkerDeliveryView.as_view(), name='worker-deliveries'),
    path('deliveries/<int:delivery_id>/update-status/', UpdateDeliveryStatusView.as_view(), name='update-delivery-status'),
    path('chat/messages/<int:delivery_id>/', ChatMessageView.as_view(), name='chat-messages'),
    path('chat/messages/', ChatMessageView.as_view(), name='send-message'),
    path('deliveries/messages/unread/', UnreadMessagesView.as_view(), name='unread-messages'),
    path('deliveries/<int:delivery_id>/mark-read/', UnreadMessagesView.as_view(), name='mark-messages-read'),
    path('deliveries/<int:delivery_id>/update-location/', DeliveryLocationView.as_view(), name='update-location'),
    path('deliveries/<int:delivery_id>/location/', DeliveryLocationView.as_view(), name='get-location'),
    path('deliveries/<int:delivery_id>/update-status/', UpdateDeliveryStatusView.as_view(), name='update-status'),
]