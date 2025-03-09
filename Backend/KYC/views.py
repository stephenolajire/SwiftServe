from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from .models import KYCVerification
from .serializers import KYCVerificationSerializer
import logging

logger = logging.getLogger(__name__)

class KYCSubmissionView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)
    
    def post(self, request):
        try:
            # Log incoming data for debugging
            logger.info(f"Received KYC submission from user: {request.user.email}")
            logger.debug(f"Form data: {request.data}")
            logger.debug(f"Files: {request.FILES}")

            # Check if KYC already exists
            if KYCVerification.objects.filter(user=request.user).exists():
                return Response({
                    'status': 'error',
                    'message': 'KYC verification already submitted'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Combine form data and files
            data = request.data.dict()
            if 'idDocument' in request.FILES:
                data['idDocument'] = request.FILES['idDocument']
            if 'selfieImage' in request.FILES:
                data['selfieImage'] = request.FILES['selfieImage']
                
            serializer = KYCVerificationSerializer(data=data)
            if serializer.is_valid():
                kyc = serializer.save(user=request.user)
                kyc.initial_verification()  # Perform initial checks
                
                return Response({
                    'status': 'success',
                    'message': 'KYC verification submitted successfully',
                    'kyc_status': kyc.status,
                    'verification_id': kyc.id
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
                'message': 'An error occurred while processing your request'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class KYCStatusView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get KYC verification status"""
        kyc = KYCVerification.objects.filter(user=request.user).first()
        if not kyc:
            return Response({
                'status': 'NOT_SUBMITTED',
                'message': 'KYC verification not submitted'
            })
            
        return Response({
            'status': kyc.status,
            'message': kyc.rejectionReason if kyc.status in ['REJECTED', 'INCOMPLETE'] else None,
            'review_flag': kyc.reviewFlag,
            'verification_date': kyc.verificationDate,
            'last_updated': kyc.lastUpdated,
            'name_similarity': kyc.nameSimilarityScore
        })

class KYCUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request):
        """Update incomplete or rejected KYC verification"""
        kyc = KYCVerification.objects.filter(user=request.user).first()
        if not kyc:
            return Response({
                'status': 'error',
                'message': 'No KYC verification found'
            }, status=status.HTTP_404_NOT_FOUND)
            
        if kyc.status not in ['INCOMPLETE', 'REJECTED']:
            return Response({
                'status': 'error',
                'message': 'Cannot update completed KYC verification'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        serializer = KYCVerificationSerializer(kyc, data=request.data, partial=True)
        if serializer.is_valid():
            kyc = serializer.save()
            kyc.initial_verification()
            
            return Response({
                'status': 'success',
                'message': 'KYC verification updated successfully',
                'kyc_status': kyc.status
            })
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)