from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from .models import Delivery
from .serializers import DeliverySerializer
from Auth.models import CustomUser
from Auth.serializers import IndividualSerializer

class DeliveryListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        user_type = user.user_type

        if user_type == 'CLIENT':
            # Clients see their own deliveries
            deliveries = Delivery.objects.filter(client=user)
        
        elif user_type == 'INDIVIDUAL':
            # Individuals see deliveries in their local government
            deliveries = Delivery.objects.filter(
                pickupLg=user.localGovernment,
                status='PENDING'
            )
        
        elif user_type == 'WORKER':
            if user.fleetType == 'motorcycle':
                # Motorcycle workers see deliveries in their city
                deliveries = Delivery.objects.filter(
                    pickupCity=user.city,
                    status='PENDING'
                )
            else:
                # Other workers see deliveries in their state
                deliveries = Delivery.objects.filter(
                    pickupState=user.state,
                    status='PENDING'
                )
        else:
            return Response({
                'error': 'Invalid user type'
            }, status=status.HTTP_403_FORBIDDEN)

        # Order deliveries by creation date
        deliveries = deliveries.order_by('-created_at')

        serializer = DeliverySerializer(deliveries, many=True)
        return Response({
            'status': 'success',
            'count': deliveries.count(),
            'data': serializer.data
        })

    def post(self, request):
        if request.user.user_type != 'CLIENT':
            return Response({
                'error': 'Only clients can create delivery requests'
            }, status=status.HTTP_403_FORBIDDEN)

        serializer = DeliverySerializer(
            data=request.data,
            context={'request': request}
        )

        if serializer.is_valid():
            delivery = serializer.save()
            return Response({
                'status': 'success',
                'message': 'Delivery request created successfully',
                'data': DeliverySerializer(delivery).data
            }, status=status.HTTP_201_CREATED)

        return Response({
            'status': 'error',
            'message': 'Validation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    

