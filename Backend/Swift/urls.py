from django.urls import path
from .views import (
    DeliveryListCreateView,
    AcceptDeliveryView,
    WorkerDeliveryView,
    UpdateDeliveryStatusView,
    ChatMessageView,
    UnreadMessagesView,
    DeliveryLocationView,
    UpdateDeliveryDistanceView,
    ConfirmDeliveryView,
    VerifyPaymentView,
    PaystackWebhookView,
    InitiatePaymentView,
    RateDeliveryView
)

urlpatterns = [
    path('deliveries/', DeliveryListCreateView.as_view(), name='delivery-list-create'),
    path('deliveries/<int:delivery_id>/accept/', AcceptDeliveryView.as_view(), name='accept-delivery'),
    path('deliveries/worker/', WorkerDeliveryView.as_view(), name='worker-deliveries'),
    path('chat/messages/<int:delivery_id>/', ChatMessageView.as_view(), name='chat-messages'),
    path('chat/messages/', ChatMessageView.as_view(), name='send-message'),
    path('deliveries/messages/unread/', UnreadMessagesView.as_view(), name='unread-messages'),
    path('deliveries/<int:delivery_id>/mark-read/', UnreadMessagesView.as_view(), name='mark-messages-read'),
    path('deliveries/<int:delivery_id>/update-location/', DeliveryLocationView.as_view(), name='update-location'),
    path('deliveries/<int:delivery_id>/location/', DeliveryLocationView.as_view(), name='get-location'),
    path('deliveries/<int:delivery_id>/update-status/', UpdateDeliveryStatusView.as_view(), name='update-status'),
    path('deliveries/<int:delivery_id>/update-distance/', UpdateDeliveryDistanceView.as_view(), name='update-delivery-distance'),
    path('deliveries/<int:delivery_id>/confirm-delivery/', ConfirmDeliveryView.as_view(), name='confirm-delivery'),
    # path('deliveries/<int:delivery_id>/process-payment/', ConfirmDeliveryView.as_view(), name='process-payment'),
    path('payments/verify/', VerifyPaymentView.as_view(), name='verify-payment'),
    path('payments/webhook/', PaystackWebhookView.as_view(), name='paystack-webhook'),
    path('deliveries/<int:delivery_id>/initiate-payment/', InitiatePaymentView.as_view(), name='initiate-payment'),
    path('deliveries/<int:delivery_id>/rate/', RateDeliveryView.as_view(), name='rate-delivery'),
]