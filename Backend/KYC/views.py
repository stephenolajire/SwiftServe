from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.exceptions import ValidationError
from .models import KYCVerification
from .serializers import KYCVerificationSerializer
import logging

logger = logging.getLogger(__name__)

class KYCSubmissionView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)
    
    def post(self, request):
        """Handle KYC submission"""

        user = request.user
        try:
            # Log incoming request data
            logger.info(f"Received KYC submission from user: {request.user.email}")
            logger.debug(f"Form data: {request.data}")
            logger.debug(f"Files: {request.FILES}")

            # Check for existing KYC
            if KYCVerification.objects.filter(user=request.user).exists():
                return Response({
                    'status': 'error',
                    'message': 'KYC verification already submitted'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Create serializer with context
            serializer = KYCVerificationSerializer(
                data=request.data,
                context={'request': request}
            )

            if serializer.is_valid():
                # Save KYC verification
                user.kyc_status = "PENDING"
                user.save()  # Add this line to save user status
                kyc = serializer.save()
                kyc.status = "PENDING"
                kyc.save()  # Add this line to save kyc status
                logger.info(f"KYC verification created for user: {request.user.email}")

                return Response({
                    'status': 'success',
                    'message': 'KYC verification submitted successfully',
                    'data': {
                        'id': kyc.id,
                        'status': kyc.status,
                        'verificationDate': kyc.verificationDate.strftime('%Y-%m-%d %H:%M:%S')
                    }
                }, status=status.HTTP_201_CREATED)

            logger.error(f"Validation errors: {serializer.errors}")
            return Response({
                'status': 'error',
                'message': 'Invalid data provided',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.exception("Error processing KYC submission")
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get(self, request):
        """Get user's KYC status"""
        try:
            kyc = KYCVerification.objects.filter(user=request.user).first()
            if not kyc:
                return Response({
                    'status': 'not_found',
                    'message': 'No KYC verification found'
                }, status=status.HTTP_404_NOT_FOUND)

            serializer = KYCVerificationSerializer(
                kyc,
                context={'request': request}
            )
            return Response({
                'status': 'success',
                'data': serializer.data
            })

        except Exception as e:
            logger.exception("Error retrieving KYC status")
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request):
        """Update rejected KYC submission"""
        try:
            kyc = KYCVerification.objects.filter(user=request.user).first()
            if not kyc:
                return Response({
                    'status': 'error',
                    'message': 'No KYC verification found'
                }, status=status.HTTP_404_NOT_FOUND)

            if kyc.status not in ['REJECTED', 'INCOMPLETE']:
                return Response({
                    'status': 'error',
                    'message': 'Only rejected or incomplete KYC can be updated'
                }, status=status.HTTP_400_BAD_REQUEST)

            serializer = KYCVerificationSerializer(
                kyc,
                data=request.data,
                context={'request': request},
                partial=True
            )

            if serializer.is_valid():
                kyc = serializer.save()
                kyc.status = 'PENDING'  # Reset status to pending
                kyc.save()

                return Response({
                    'status': 'success',
                    'message': 'KYC verification updated successfully',
                    'data': serializer.data
                })

            return Response({
                'status': 'error',
                'message': 'Invalid data provided',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.exception("Error updating KYC submission")
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)