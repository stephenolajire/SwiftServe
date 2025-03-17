from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import CompanyUserSerializer, WorkersSerializer, IndividualSerializer
from .models import CustomUser
from django.core.cache import cache
from .utils import generate_otp, send_otp_email
from django.utils import timezone
from .utils import send_registration_email
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class CompanyRegistrationView(APIView):
    def post(self, request):
        try:
            serializer = CompanyUserSerializer(data=request.data)
            if serializer.is_valid():
                # Check if company with same registration number exists
                reg_number = serializer.validated_data.get('registrationNumber')
                if CustomUser.objects.filter(registrationNumber=reg_number).exists():
                    return Response({
                        'error': 'A company with this registration number already exists'
                    }, status=status.HTTP_400_BAD_REQUEST)

                # Save company with pending KYC status
                company = serializer.save(
                    user_type='COMPANY',
                    kyc_status='PENDING',
                    is_user_verified=False
                )

                try:
                    # Send registration email
                    send_registration_email('COMPANY', serializer.validated_data)
                except Exception:
                    pass  # Continue even if email fails

                return Response({
                    'message': 'Company registered successfully',
                    'company_id': company.id,
                    'email': company.email,
                    'next_steps': [
                        'Complete email verification',
                        'Submit KYC documents',
                        'Wait for KYC approval'
                    ]
                }, status=status.HTTP_201_CREATED)

            return Response({
                'error': 'Validation failed',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception:
            return Response({
                'error': 'Registration failed',
                'message': 'An unexpected error occurred during registration'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
class IndividualRegistrationView(APIView):
    def post(self, request):

        data = request.data
        print(data)
        
        serializer = IndividualSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
             # Send registration email
            send_registration_email('INDIVIDUAL', serializer.validated_data)
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

        try:
            # Create a new dict with the data
            worker_data = {
                'email': request.data.get('email'),
                'username':request.data.get('username'),
                'password': request.data.get('password'),
                'firstName': request.data.get('firstName'),
                'lastName': request.data.get('lastName'),
                'phoneNumber': request.data.get('phoneNumber'),
                'dob': request.data.get('dob'),
                'address': request.data.get('address'),
                'city': request.data.get('city'),
                'state': request.data.get('state'),
                'country': request.data.get('country'),
                'localGovernment': request.data.get('localGovernment'),
                'vehicleType': request.data.get('vehicleType'),
                'vehiclePlateNumber': request.data.get('vehiclePlateNumber'),
                'company': request.user.id,
                'user_type': 'WORKER'
            }

            # Handle file uploads
            file_fields = [
                'profileImage', 
                'driversLicense', 
                'vehicleRegistration'
            ]
            
            for field in file_fields:
                if field in request.FILES:
                    worker_data[field] = request.FILES[field]

            serializer = WorkersSerializer(data=worker_data)
            if serializer.is_valid():
                worker = serializer.save()
                
                try:
                    # Send registration email
                    send_registration_email('WORKER', serializer.validated_data)
                except Exception as e:
                    print(f"Failed to send email: {str(e)}")

                return Response({
                    'status': 'success',
                    'message': 'Worker registered successfully',
                    'data': {
                        'worker_id': worker.id,
                        'email': worker.email,
                        'firstName': worker.firstName,
                        'lastName': worker.lastName,
                        'company': request.user.companyName,
                        'next_steps': [
                            'Complete email verification',
                            'Wait for account activation'
                        ]
                    }
                }, status=status.HTTP_201_CREATED)

            return Response({
                'status': 'error',
                'message': 'Validation failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                'status': 'error',
                'message': 'Registration failed',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CompanyWorkersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.user_type != 'COMPANY':
            return Response({
                'error': 'Only companies can view their workers'
            }, status=status.HTTP_403_FORBIDDEN)

        try:
            workers = CustomUser.objects.filter(
                company=request.user,
                user_type='WORKER'
            ).order_by('-date_joined')

            serializer = WorkersSerializer(workers, many=True)

            return Response({
                'status': 'success',
                'data': {
                    'company': request.user.companyName,
                    'total_workers': workers.count(),
                    'workers': serializer.data
                }
            })

        except Exception as e:
            return Response({
                'status': 'error',
                'message': 'Failed to fetch workers',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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


class VerifyResetOTPView(APIView):
    """Verify OTP for password reset"""

    def post(self, request):
        user_id = request.data.get('user_id')
        otp = request.data.get('otp')

        if not all([user_id, otp]):
            return Response({
                'error': 'User ID and OTP are required'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = CustomUser.objects.get(id=user_id)
            
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

            # Store verification token for password reset
            reset_token = generate_otp()  # Generate a new token
            reset_token_key = f'password_reset_token_{user.id}'
            cache.set(reset_token_key, reset_token, timeout=300)  # 5 minutes

            return Response({
                'message': 'OTP verified successfully',
                'reset_token': reset_token
            })

        except CustomUser.DoesNotExist:
            return Response({
                'error': 'Invalid user'
            }, status=status.HTTP_404_NOT_FOUND)


class ResetPasswordView(APIView):
    """Set new password after OTP verification"""

    def put(self, request):
        user_id = request.data.get('user_id')
        reset_token = request.data.get('reset_token')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')

        if not all([user_id, reset_token, new_password, confirm_password]):
            return Response({
                'error': 'All fields are required'
            }, status=status.HTTP_400_BAD_REQUEST)

        if new_password != confirm_password:
            return Response({
                'error': 'Passwords do not match'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = CustomUser.objects.get(id=user_id)
            
            # Verify reset token
            reset_token_key = f'password_reset_token_{user.id}'
            stored_token = cache.get(reset_token_key)

            if not stored_token or stored_token != reset_token:
                return Response({
                    'error': 'Invalid or expired reset token'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Update password
            user.set_password(new_password)
            user.save()
            
            # Clear all reset-related cache
            cache.delete(reset_token_key)
            cache.delete(f'password_reset_otp_{user.id}')

            return Response({
                'message': 'Password reset successful'
            })

        except CustomUser.DoesNotExist:
            return Response({
                'error': 'Invalid user'
            }, status=status.HTTP_404_NOT_FOUND)


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