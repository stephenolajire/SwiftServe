from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import CompanyUserSerializer, WorkersSerializer, IndividualSerializer
from .models import CustomUser
from django.core.cache import cache
from .utils import generate_otp, send_otp_email
from django.utils import timezone

class CompanyRegistrationView(APIView):
    def post(self, request):
        serializer = CompanyUserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user_type='COMPANY')
            return Response({
                'message': 'Company registered successfully'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class IndividualRegistrationView(APIView):
    def post(self, request):
        
        serializer = IndividualSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Individual registered successfully'
            }, status=status.HTTP_201_CREATED)
        
        # Log validation errors
        print("Validation errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class WorkerRegistrationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Check if the authenticated user is a company
        if request.user.user_type != 'COMPANY':
            return Response({
                'error': 'Only companies can register workers'
            }, status=status.HTTP_403_FORBIDDEN)

        # Add the company to the worker data
        worker_data = request.data.copy()
        worker_data['company'] = request.user.id
        worker_data['user_type'] = 'WORKER'

        serializer = IndividualSerializer(data=worker_data)
        if serializer.is_valid():
            worker = serializer.save()
            return Response({
                'message': 'Worker registered successfully',
                'worker_id': worker.id,
                'company': request.user.company_name
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CompanyWorkersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Check if the authenticated user is a company
        if request.user.user_type != 'COMPANY':
            return Response({
                'error': 'Only companies can view their workers'
            }, status=status.HTTP_403_FORBIDDEN)

        # Get all workers for this company
        workers = request.user.workers.all()
        serializer = WorkersSerializer(workers, many=True)
        
        return Response({
            'company': request.user.company_name,
            'workers': serializer.data
        })



class RequestVerificationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        
        # Check if user is already verified
        if user.is_user_verified:
            return Response({
                'message': 'User is already verified'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate OTP and store in cache
        otp = generate_otp()
        cache_key = f'verification_otp_{user.id}'
        cache.set(cache_key, otp, timeout=300)  # OTP valid for 5 minutes
        
        # Send OTP via email
        if send_otp_email(user.email, otp):
            return Response({
                'message': 'Verification code sent to your email'
            }, status=status.HTTP_200_OK)
        
        return Response({
            'error': 'Failed to send verification code'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VerifyOTPView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        otp = request.data.get('otp')

        if not otp:
            return Response({
                'error': 'OTP is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check if user is already verified
        if user.is_user_verified:
            return Response({
                'message': 'User is already verified'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Verify OTP
        cache_key = f'verification_otp_{user.id}'
        stored_otp = cache.get(cache_key)

        if not stored_otp:
            return Response({
                'error': 'OTP has expired. Please request a new one'
            }, status=status.HTTP_400_BAD_REQUEST)

        if otp != stored_otp:
            return Response({
                'error': 'Invalid OTP'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Mark user as verified
        user.is_user_verified = True
        user.save()
        
        # Clear the OTP from cache
        cache.delete(cache_key)

        return Response({
            'message': 'User verified successfully'
        }, status=status.HTTP_200_OK)


class ForgotPasswordView(APIView):
    """Handle password reset request and send OTP"""
    
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({
                'error': 'Email is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({
                'error': 'No user found with this email'
            }, status=status.HTTP_404_NOT_FOUND)

        # Generate and store OTP
        otp = generate_otp()
        cache_key = f'password_reset_otp_{user.id}'
        cache.set(cache_key, otp, timeout=300)  # OTP valid for 5 minutes

        # Send OTP via email
        if send_otp_email(user.email, otp):
            return Response({
                'message': 'Password reset code sent to your email',
                'user_id': user.id
            }, status=status.HTTP_200_OK)
        
        return Response({
            'error': 'Failed to send reset code'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ResetPasswordView(APIView):
    """Reset password with OTP verification"""

    def post(self, request):
        user_id = request.data.get('user_id')
        otp = request.data.get('otp')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')

        # Validate input
        if not all([user_id, otp, new_password, confirm_password]):
            return Response({
                'error': 'All fields are required'
            }, status=status.HTTP_400_BAD_REQUEST)

        if new_password != confirm_password:
            return Response({
                'error': 'Passwords do not match'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            return Response({
                'error': 'Invalid user'
            }, status=status.HTTP_404_NOT_FOUND)

        # Verify OTP
        cache_key = f'password_reset_otp_{user.id}'
        stored_otp = cache.get(cache_key)

        if not stored_otp:
            return Response({
                'error': 'OTP has expired. Please request a new one'
            }, status=status.HTTP_400_BAD_REQUEST)

        if otp != stored_otp:
            return Response({
                'error': 'Invalid OTP'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Update password
        user.set_password(new_password)
        user.save()
        
        # Clear the OTP from cache
        cache.delete(cache_key)

        return Response({
            'message': 'Password reset successful'
        }, status=status.HTTP_200_OK)


class RequestAccountDeletionView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        
        if user.is_pending_deletion:
            return Response({
                'error': 'Account is already scheduled for deletion'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user.schedule_deletion()
        deletion_date = user.scheduled_deletion_date.strftime('%Y-%m-%d %H:%M:%S')
        
        return Response({
            'message': 'Account scheduled for deletion',
            'deletion_date': deletion_date,
            'message': 'You can cancel this deletion within 7 days'
        }, status=status.HTTP_200_OK)

class CancelAccountDeletionView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        
        if not user.is_pending_deletion:
            return Response({
                'error': 'Account is not scheduled for deletion'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        if user.scheduled_deletion_date < timezone.now():
            return Response({
                'error': 'Deletion grace period has expired'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        user.cancel_deletion()
        
        return Response({
            'message': 'Account deletion cancelled successfully'
        }, status=status.HTTP_200_OK)

class AccountDeletionStatusView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        if not user.is_pending_deletion:
            return Response({
                'is_pending_deletion': False
            })
            
        time_remaining = user.scheduled_deletion_date - timezone.now()
        days_remaining = time_remaining.days
        
        return Response({
            'is_pending_deletion': True,
            'scheduled_deletion_date': user.scheduled_deletion_date,
            'days_remaining': days_remaining
        })