from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from django.db.models import Count, Sum
from .models import *
from .serializers import *
from Auth.models import CustomUser
from KYC.models import KYCVerification
from .email_utils import send_kyc_notification_email
from django.db.models import Count
from django.db.models.functions import TruncDate, TruncMonth
from datetime import timedelta
from django.utils import timezone

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_stats(request):
    stats = {
        'totalUsers': CustomUser.objects.count(),
        'totalWorkers': CustomUser.objects.filter(user_type='WORKER').count(),
        'totalCompanies': CustomUser.objects.filter(user_type='COMPANY').count(),
        'totalClients': CustomUser.objects.filter(user_type='CLIENT').count(),
        'pendingKYC': KYCVerification.objects.filter(status='PENDING').count(),
        'totalRevenue': RevenueData.objects.aggregate(total=Sum('amount'))['total'] or 0,
        'revenueData': RevenueDataSerializer(RevenueData.objects.all(), many=True).data,
        'userActivity': UserActivitySerializer(UserActivity.objects.all(), many=True).data
    }
    return Response(stats)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_users(request):
    users = CustomUser.objects.all()
    serializer = UserListSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_kyc_requests(request):
    kyc_requests = KYCVerification.objects.filter(status='PENDING')
    serializer = KYCRequestSerializer(kyc_requests, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def handle_kyc_action(request, user_id, action):
    try:
        kyc = KYCVerification.objects.get(user_id=user_id)
        user = CustomUser.objects.get(id=user_id)
        reason = request.data.get('reason')

        if action == 'approve':
            kyc.status = 'APPROVED'
            user.kyc_status = 'APPROVED'
        elif action == 'reject':
            kyc.status = 'REJECTED'
            user.kyc_status = False
        else:
            return Response({'error': 'Invalid action'}, status=400)

        kyc.save()
        user.save()

        # Send email notification
        try:
            send_kyc_notification_email(user.email, kyc.status, reason)
        except Exception as e:
            print(f"Failed to send email: {str(e)}")

        return Response({
            'message': f'KYC {action}d successfully',
            'status': kyc.status,
            'email_sent': True
        })
    except (KYCVerification.DoesNotExist, CustomUser.DoesNotExist):
        return Response({'error': 'KYC or User not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def handle_user_action(request, user_id, action):
    try:
        user = CustomUser.objects.get(id=user_id)
        if action == 'suspend':
            user.is_active = False
        elif action == 'activate':
            user.is_active = True
        user.save()
        return Response({'message': f'User {action}d successfully'})
    except CustomUser.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_user_details(request, user_id):
    try:
        user = CustomUser.objects.get(id=user_id)
        serializer = UserDetailSerializer(user)
        return Response(serializer.data)
    except CustomUser.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_user_activity(request):
    # Get the last 12 months
    twelve_months_ago = timezone.now() - timedelta(days=365)
    
    # Get new user signups per month
    new_users = CustomUser.objects.filter(
        date_joined__gte=twelve_months_ago
    ).annotate(
        month=TruncMonth('date_joined')
    ).values('month').annotate(
        count=Count('id')
    ).order_by('month')

    # Get active users per month
    active_users = CustomUser.objects.filter(
        last_login__gte=twelve_months_ago
    ).annotate(
        month=TruncMonth('last_login')
    ).values('month').annotate(
        count=Count('id')
    ).order_by('month')

    # Format the data
    formatted_data = {
        'newUsers': [
            {
                'month': entry['month'].strftime('%B %Y'),
                'count': entry['count']
            } for entry in new_users
        ],
        'activeUsers': [
            {
                'month': entry['month'].strftime('%B %Y'),
                'count': entry['count']
            } for entry in active_users
        ]
    }

    return Response(formatted_data)
