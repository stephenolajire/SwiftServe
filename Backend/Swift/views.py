from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q, F
from .models import Delivery
from .serializers import DeliverySerializer
from Auth.models import CustomUser
from Auth.serializers import IndividualSerializer
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.conf import settings
from django.db.models import Sum
from datetime import datetime, timedelta
from .models import ChatMessage
from .serializers import ChatMessageSerializer
from django.utils import timezone

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

class AcceptDeliveryView(APIView):
    permission_classes = [IsAuthenticated]

    def send_acceptance_email(self, delivery, worker):
        subject = "Your Delivery Request Has Been Accepted"
        message = f"""
            Hello {delivery.client.firstName},

            Your delivery request for {delivery.itemName} has been accepted by a courier.

            Courier Details:
            Name: {worker.firstName} {worker.lastName}
            Phone: {worker.phoneNumber}

            Delivery Details:
            - Item: {delivery.itemName}
            - Pickup Address: {delivery.pickupAddress}
            - Delivery Address: {delivery.deliveryAddress}
            - Status: Accepted

            You can track your delivery through your dashboard. The courier will contact you shortly.

            Best regards,
            SwiftServe Team
                    """

        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [delivery.client.email],
                fail_silently=False,
            )
        except Exception as e:
            print(f"Error sending email: {str(e)}")

    def post(self, request, delivery_id):
        try:
            # Get the user and delivery
            user = request.user
            delivery = get_object_or_404(Delivery, id=delivery_id)

            # Check if user is a worker
            if user.user_type not in ['WORKER', 'INDIVIDUAL']:
                return Response({
                    'status': 'error',
                    'message': 'Only workers can accept deliveries'
                }, status=status.HTTP_403_FORBIDDEN)

            # Check if delivery is still pending
            if delivery.status != 'PENDING':
                return Response({
                    'status': 'error',
                    'message': 'This delivery is no longer available'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Check location constraints based on fleet type
            if user.user_type == 'WORKER':
                if user.fleetType == 'motorcycle':
                    if delivery.pickupCity != user.city:
                        return Response({
                            'status': 'error',
                            'message': 'This delivery is outside your city coverage'
                        }, status=status.HTTP_403_FORBIDDEN)
                else:
                    if delivery.pickupState != user.state:
                        return Response({
                            'status': 'error',
                            'message': 'This delivery is outside your state coverage'
                        }, status=status.HTTP_403_FORBIDDEN)
            else:  # INDIVIDUAL
                if delivery.pickupLg != user.localGovernment:
                    return Response({
                        'status': 'error',
                        'message': 'This delivery is outside your local government area'
                    }, status=status.HTTP_403_FORBIDDEN)

            # Update delivery status and assign worker
            delivery.status = 'ACCEPTED'
            delivery.worker = user
            delivery.save()

            # Send email notification
            self.send_acceptance_email(delivery, user)

            return Response({
                'status': 'success',
                'message': 'Delivery accepted successfully',
                'data': {
                    'delivery_id': delivery.id,
                    'status': delivery.status,
                    'item_name': delivery.itemName,
                    'pickup_address': delivery.pickupAddress,
                    'delivery_address': delivery.deliveryAddress
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class WorkerDeliveryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            
            # Check if user is a worker or individual
            if user.user_type not in ['WORKER', 'INDIVIDUAL']:
                return Response({
                    'status': 'error',
                    'message': 'Unauthorized access'
                }, status=status.HTTP_403_FORBIDDEN)

            # Get all deliveries associated with the worker
            deliveries = Delivery.objects.filter(worker=user)
            
            # Get today's date
            today = datetime.now().date()
            
            # Calculate today's earnings
            today_earnings = deliveries.filter(
                status='DELIVERED',
                completed_at__date=today
            ).aggregate(
                total=Sum('worker_earnings')
            )['total'] or 0

            # Calculate weekly earnings
            week_start = today - timedelta(days=today.weekday())
            weekly_earnings = deliveries.filter(
                status='DELIVERED',
                completed_at__date__gte=week_start
            ).aggregate(
                total=Sum('worker_earnings')
            )['total'] or 0

            # Calculate monthly earnings
            month_start = today.replace(day=1)
            monthly_earnings = deliveries.filter(
                status='DELIVERED',
                completed_at__date__gte=month_start
            ).aggregate(
                total=Sum('worker_earnings')
            )['total'] or 0

            # Calculate rating
            completed_deliveries = deliveries.filter(status='DELIVERED')
            total_rating = completed_deliveries.aggregate(
                total=Sum('rating')
            )['total'] or 0
            rating = round(total_rating / completed_deliveries.count(), 1) if completed_deliveries.count() > 0 else 0

            # Serialize the deliveries
            serializer = DeliverySerializer(deliveries, many=True)

            return Response({
                'status': 'success',
                'data': {
                    'worker': {
                        'firstName': user.firstName,
                        'lastName': user.lastName,
                        'phoneNumber': user.phoneNumber,
                        'rating': rating
                    },
                    'deliveries': serializer.data,
                    'earnings': {
                        'today': today_earnings,
                        'week': weekly_earnings,
                        'month': monthly_earnings
                    },
                    'stats': {
                        'pending': deliveries.filter(status='PENDING').count(),
                        'active': deliveries.filter(
                            status__in=['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT']
                        ).count(),
                        'completed': deliveries.filter(status='DELIVERED').count()
                    }
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UpdateDeliveryStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, delivery_id):
        try:
            delivery = get_object_or_404(Delivery, id=delivery_id)
            new_status = request.data.get('status')

            # Verify the worker is assigned to this delivery
            if request.user != delivery.worker:
                return Response({
                    'status': 'error',
                    'message': 'You are not authorized to update this delivery'
                }, status=status.HTTP_403_FORBIDDEN)

            # Validate status transition
            valid_transitions = {
                'ACCEPTED': ['IN_TRANSIT'],
                'IN_TRANSIT': ['DELIVERED'],
            }

            if delivery.status not in valid_transitions or new_status not in valid_transitions.get(delivery.status, []):
                return Response({
                    'status': 'error',
                    'message': 'Invalid status transition'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Update delivery status
            delivery.status = new_status
            delivery.updated_at = timezone.now()
            
            # Set transit start time if moving to IN_TRANSIT
            if new_status == 'IN_TRANSIT':
                delivery.transit_start_time = timezone.now()
            
            # Set delivery completion time if DELIVERED
            elif new_status == 'DELIVERED':
                delivery.delivery_completed_at = timezone.now()

            delivery.save()

            return Response({
                'status': 'success',
                'message': 'Delivery status updated successfully',
                'data': {
                    'id': delivery.id,
                    'status': delivery.status,
                    'updated_at': delivery.updated_at,
                    'transit_start_time': delivery.transit_start_time,
                    'delivery_completed_at': delivery.delivery_completed_at
                }
            })

        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ChatMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def can_access_chat(self, user, delivery):
        """Check if user can access this chat"""
        return (
            user == delivery.worker or 
            user == delivery.client
        )

    def post(self, request):
        try:
            delivery_id = request.data.get('delivery_id')
            delivery = get_object_or_404(Delivery, id=delivery_id)

            # Verify user can access this chat
            if not self.can_access_chat(request.user, delivery):
                return Response({
                    'status': 'error',
                    'message': 'You do not have permission to access this chat'
                }, status=status.HTTP_403_FORBIDDEN)

            # Create message data
            message_data = {
                'delivery': delivery.id,
                'message': request.data.get('message'),
                'type': request.data.get('type', 'GENERAL'),
            }

            if 'image' in request.FILES:
                message_data['image'] = request.FILES['image']

            serializer = ChatMessageSerializer(data=message_data)
            if serializer.is_valid():
                message = serializer.save(
                    sender=request.user,
                    sender_type='WORKER' if request.user == delivery.worker else 'CLIENT'
                )

                return Response({
                    'status': 'success',
                    'data': ChatMessageSerializer(message).data
                }, status=status.HTTP_201_CREATED)
            
            return Response({
                'status': 'error',
                'message': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get(self, request, delivery_id):
        try:
            delivery = get_object_or_404(Delivery, id=delivery_id)

            # Verify user can access this chat
            if not self.can_access_chat(request.user, delivery):
                return Response({
                    'status': 'error',
                    'message': 'You do not have permission to access this chat'
                }, status=status.HTTP_403_FORBIDDEN)

            messages = ChatMessage.objects.filter(delivery_id=delivery_id)
            serializer = ChatMessageSerializer(messages, many=True)
            
            return Response({
                'status': 'success',
                'data': serializer.data
            })
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UnreadMessagesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Get all deliveries for the user
            deliveries = Delivery.objects.filter(
                Q(worker=request.user) | Q(client=request.user)
            )

            # Count unread messages for each delivery
            unread_counts = {}
            for delivery in deliveries:
                # Get last read timestamp for this user
                last_read_str = delivery.last_read.get(str(request.user.id))
                
                query = Q(delivery=delivery) & ~Q(sender=request.user)
                
                if last_read_str:
                    try:
                        last_read = datetime.fromisoformat(last_read_str.replace('Z', '+00:00'))
                        query &= Q(created_at__gt=last_read)
                    except ValueError:
                        pass

                # Count unread messages
                count = ChatMessage.objects.filter(query).count()
                
                if count > 0:
                    unread_counts[str(delivery.id)] = count

            return Response({
                'status': 'success',
                'data': unread_counts
            })

        except Exception as e:
            print(f"Error in UnreadMessagesView: {str(e)}")  # Debug log
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request, delivery_id):
        try:
            delivery = get_object_or_404(Delivery, id=delivery_id)
            
            # Verify user has access to this delivery
            if request.user not in [delivery.worker, delivery.client]:
                return Response({
                    'status': 'error',
                    'message': 'Unauthorized access'
                }, status=status.HTTP_403_FORBIDDEN)

            # Update last read timestamp
            last_read = delivery.last_read
            last_read[str(request.user.id)] = timezone.now().isoformat()
            delivery.last_read = last_read
            delivery.save(update_fields=['_last_read'])

            return Response({
                'status': 'success',
                'message': 'Messages marked as read'
            })

        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DeliveryLocationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, delivery_id):
        try:
            delivery = get_object_or_404(Delivery, id=delivery_id)
            
            # Verify user is the worker
            if request.user != delivery.worker:
                return Response({
                    'status': 'error',
                    'message': 'Unauthorized'
                }, status=status.HTTP_403_FORBIDDEN)

            # Update location
            delivery.current_latitude = request.data.get('latitude')
            delivery.current_longitude = request.data.get('longitude')
            delivery.location_updated_at = timezone.now()
            delivery.save()

            return Response({'status': 'success'})

        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get(self, request, delivery_id):
        try:
            delivery = get_object_or_404(Delivery, id=delivery_id)
            
            # Verify user is authorized
            if request.user not in [delivery.worker, delivery.client]:
                return Response({
                    'status': 'error',
                    'message': 'Unauthorized'
                }, status=status.HTTP_403_FORBIDDEN)

            return Response({
                'status': 'success',
                'data': {
                    'latitude': float(delivery.current_latitude) if delivery.current_latitude else None,
                    'longitude': float(delivery.current_longitude) if delivery.current_longitude else None,
                    'updated_at': delivery.location_updated_at
                }
            })

        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


