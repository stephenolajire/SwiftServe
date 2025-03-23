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
import requests

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
            user = request.user
            delivery = get_object_or_404(Delivery, id=delivery_id)

            # Check if user is a worker
            if user.user_type not in ['WORKER', 'INDIVIDUAL']:
                return Response({
                    'status': 'error',
                    'message': 'Only workers can accept deliveries'
                }, status=status.HTTP_403_FORBIDDEN)

            # Check if worker has any active deliveries
            active_deliveries = Delivery.objects.filter(
                worker=user,
                status__in=['PENDING', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT']
            ).exists()

            if active_deliveries:
                return Response({
                    'status': 'error',
                    'message': 'You cannot accept new deliveries while you have active deliveries'
                }, status=status.HTTP_400_BAD_REQUEST)

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
                status='RECEIVED',
                completed_at__date=today
            ).aggregate(
                total=Sum('worker_earnings')
            )['total'] or 0

            # Calculate weekly earnings
            week_start = today - timedelta(days=today.weekday())
            weekly_earnings = deliveries.filter(
                status='RECEIVED',
                completed_at__date__gte=week_start
            ).aggregate(
                total=Sum('worker_earnings')
            )['total'] or 0

            # Calculate monthly earnings
            month_start = today.replace(day=1)
            monthly_earnings = deliveries.filter(
                status='RECEIVED',
                completed_at__date__gte=month_start
            ).aggregate(
                total=Sum('worker_earnings')
            )['total'] or 0

            # Calculate rating from RECEIVED deliveries
            received_deliveries = deliveries.filter(status='RECEIVED')
            total_rating = received_deliveries.aggregate(
                total=Sum('rating')
            )['total'] or 0
            rating = round(total_rating / received_deliveries.count(), 1) if received_deliveries.count() > 0 else 0

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
                            status__in=['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED']
                        ).count(),
                        'completed': deliveries.filter(status='RECEIVED').count()
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

class UpdateDeliveryDistanceView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, delivery_id):
        try:
            delivery = get_object_or_404(Delivery, id=delivery_id)
            
            # Verify the worker is assigned to this delivery
            if request.user != delivery.worker:
                return Response({
                    'status': 'error',
                    'message': 'Unauthorized'
                }, status=status.HTTP_403_FORBIDDEN)

            # Update distance and location
            delivery.distance_covered = request.data.get('distance', 0)
            delivery.current_latitude = request.data.get('current_latitude')
            delivery.current_longitude = request.data.get('current_longitude')
            delivery.location_updated_at = timezone.now()

            # Calculate new price
            new_price = delivery.calculate_final_price()
            delivery.estimated_price = new_price
            
            delivery.save()

            return Response({
                'status': 'success',
                'data': {
                    'distance': delivery.distance_covered,
                    'current_price': delivery.estimated_price
                }
            })

        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ConfirmDeliveryView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, delivery_id):
        try:
            delivery = get_object_or_404(Delivery, id=delivery_id)
            
            # Verify the client owns this delivery
            if request.user != delivery.client:
                return Response({
                    'status': 'error',
                    'message': 'Unauthorized to confirm this delivery'
                }, status=status.HTTP_403_FORBIDDEN)

            # Verify delivery is in correct status
            if delivery.status != 'DELIVERED':
                return Response({
                    'status': 'error',
                    'message': f'Cannot confirm delivery in {delivery.status} status'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Update delivery status
            delivery.status = 'RECEIVED'
            delivery.completed_at = timezone.now()
            delivery.save()

           

            return Response(
                {'status': 'success', 'message': 'Delivery confirmed'},
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VerifyPaymentView(APIView):
    def post(self, request):
        try:
            reference = request.data.get('reference')
            if not reference:
                return Response({
                    'status': 'error',
                    'message': 'Payment reference is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Verify payment with Paystack
            headers = {
                'Authorization': f'Bearer {settings.PAYSTACK_SECRET_KEY}'
            }
            
            response = requests.get(
                f'https://api.paystack.co/transaction/verify/{reference}',
                headers=headers
            )

            if response.status_code == 200:
                payment_data = response.json()
                
                if payment_data['data']['status'] == 'success':
                    # Update delivery payment status
                    delivery_id = payment_data['data']['metadata']['delivery_id']
                    delivery = get_object_or_404(Delivery, id=delivery_id)
                    
                    delivery.payment_status = 'COMPLETED'
                    delivery.paid_at = timezone.now()
                    
                    # Calculate worker earnings (e.g., 80% of delivery price)
                    worker_earnings = float(delivery.estimated_price) * 0.8
                    delivery.worker_earnings = worker_earnings
                    
                    delivery.save()

                    return Response({
                        'status': 'success',
                        'message': 'Payment verified successfully',
                        'delivery_id': delivery_id  # Include delivery ID in response
                    })
                else:
                    return Response({
                        'status': 'error',
                        'message': 'Payment verification failed'
                    }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Paystack webhook handler
class PaystackWebhookView(APIView):
    def post(self, request):
        # Verify webhook signature
        paystack_signature = request.headers.get('x-paystack-signature')
        if not paystack_signature:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        # Process the webhook event
        event = request.data
        if event.get('event') == 'charge.success':
            reference = event['data']['reference']
            try:
                delivery = Delivery.objects.get(payment_reference=reference)
                delivery.payment_status = 'COMPLETED'
                delivery.paid_at = timezone.now()
                delivery.save()
            except Delivery.DoesNotExist:
                pass

        return Response(status=status.HTTP_200_OK)

class InitiatePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, delivery_id):
        try:
            delivery = get_object_or_404(Delivery, id=delivery_id)
            
            # Verify the client owns this delivery
            if request.user != delivery.client:
                return Response({
                    'status': 'error',
                    'message': 'Unauthorized'
                }, status=status.HTTP_403_FORBIDDEN)

            # Verify delivery status
            if delivery.status != 'RECEIVED':
                return Response({
                    'status': 'error',
                    'message': 'Invalid delivery status for payment'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Initialize Paystack payment
            amount = int(float(delivery.estimated_price) * 100)  # Convert to kobo
            payment_reference = f'DEL_{delivery.id}_{int(timezone.now().timestamp())}'

            headers = {
                'Authorization': f'Bearer {settings.PAYSTACK_SECRET_KEY}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                'amount': amount,
                'email': request.user.email,
                'reference': payment_reference,
                'callback_url': f"{settings.FRONTEND_URL}/payment/callback",
                'metadata': {
                    'delivery_id': delivery.id,
                    'client_id': delivery.client.id,
                    'worker_id': delivery.worker.id if delivery.worker else None
                }
            }

            response = requests.post(
                'https://api.paystack.co/transaction/initialize',
                headers=headers,
                json=payload
            )

            if response.status_code == 200:
                payment_data = response.json()
                
                # Update delivery with payment reference
                delivery.payment_reference = payment_reference
                delivery.save()

                return Response({
                    'status': 'success',
                    'data': {
                        'payment_url': payment_data['data']['authorization_url'],
                        'reference': payment_reference
                    }
                })
            else:
                raise Exception('Failed to initialize payment')

        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RateDeliveryView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, delivery_id):
        try:
            delivery = get_object_or_404(Delivery, id=delivery_id)
            
            # Verify the client owns this delivery
            if request.user != delivery.client:
                return Response({
                    'status': 'error',
                    'message': 'Unauthorized to rate this delivery'
                }, status=status.HTTP_403_FORBIDDEN)

            # Validate rating
            rating = request.data.get('rating')
            if not rating or not isinstance(rating, int) or rating < 1 or rating > 5:
                return Response({
                    'status': 'error',
                    'message': 'Invalid rating. Please provide a number between 1 and 5'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Update delivery rating
            delivery.rating = rating
            delivery.save()

            return Response({
                'status': 'success',
                'message': 'Rating submitted successfully'
            })

        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


