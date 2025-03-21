from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Count
from Auth.models import CustomUser
from Swift.models import Delivery

class CompanyWorkersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Ensure user is a company
            if request.user.user_type != 'COMPANY':
                return Response({
                    'status': 'error',
                    'message': 'Only company accounts can access worker statistics'
                }, status=status.HTTP_403_FORBIDDEN)

            # Get all workers belonging to the company
            workers = CustomUser.objects.filter(
                company=request.user,
                user_type='WORKER'
            )

            # Get delivery statistics for each worker
            worker_stats = []
            for worker in workers:
                stats = {
                    'id': worker.id,
                    'firstName': worker.firstName,
                    'lastName': worker.lastName,
                    'phone': worker.phone,
                    'fleetType': worker.fleetType,
                    'city': worker.city,
                    'state': worker.state,
                    'deliveries': {
                        'pending': worker.assigned_deliveries.filter(status='PENDING').count(),
                        'in_transit': worker.assigned_deliveries.filter(status='IN_TRANSIT').count(),
                        'completed': worker.assigned_deliveries.filter(status='DELIVERED').count(),
                    }
                }
                worker_stats.append(stats)

            # Get company-wide statistics
            total_stats = {
                'total_workers': workers.count(),
                'total_deliveries': {
                    'pending': Delivery.objects.filter(
                        worker__company=request.user,
                        status='PENDING'
                    ).count(),
                    'in_transit': Delivery.objects.filter(
                        worker__company=request.user,
                        status='IN_TRANSIT'
                    ).count(),
                    'completed': Delivery.objects.filter(
                        worker__company=request.user,
                        status='DELIVERED'
                    ).count(),
                }
            }

            return Response({
                'status': 'success',
                'data': {
                    'workers': worker_stats,
                    'company_stats': total_stats
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)