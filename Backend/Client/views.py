from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework import status
# Create your views here.
class GetUserView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        return Response({
            'status': 'success',
            'data': {
                'id': user.id,
                'email': user.email,
                'firstName': user.firstName,
                'lastName': user.lastName,
                'user_type': user.user_type,
                # 'phone': user.phone,
                'city': user.city,
                'state': user.state,
                'localGovernment': user.localGovernment,
                # 'fleetType': user.fleetType
            }
        }, status=status.HTTP_200_OK)