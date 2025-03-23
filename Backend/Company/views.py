from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta
from Swift.models import Delivery, CustomUser

class DashboardOverviewView(APIView):
    def get(self, request):
        try:
            # Get company's workers
            workers = CustomUser.objects.filter(company=request.user.company)
            
            # Get all deliveries for company workers
            all_workers_deliveries = Delivery.objects.filter(worker__in=workers)

            # Calculate delivery statistics
            delivery_stats = {
                'active': all_workers_deliveries.filter(status='IN_TRANSIT').count(),
                'completed': all_workers_deliveries.filter(status='RECEIVED').count(),
                'pending': all_workers_deliveries.filter(status='PENDING').count(),
            }

            # Get recent workers data (limit to 4 for dashboard)
            recent_workers = []
            for worker in workers.order_by('-date_joined')[:4]:
                worker_deliveries = Delivery.objects.filter(worker=worker)
                worker_data = {
                    'id': worker.id,
                    'name': f"{worker.firstName} {worker.lastName}",
                    'phone': worker.phoneNumber,
                    # 'avatar': worker.avatar.url if worker.avatar else None,
                    'kyc_status': worker.kyc_status,
                    'deliveries': {
                        'completed': worker_deliveries.filter(status='RECEIVED').count(),
                        'in_transit': worker_deliveries.filter(status='IN_TRANSIT').count(),
                        'pending': worker_deliveries.filter(status='PENDING').count(),
                    },
                    'earnings': worker_deliveries.filter(
                        status='RECEIVED',
                        payment_status='COMPLETED'
                    ).aggregate(total=Sum('estimated_price'))['total'] or 0
                }
                recent_workers.append(worker_data)

            # Calculate total revenue
            total_revenue = all_workers_deliveries.filter(
                status='RECEIVED',
                payment_status='COMPLETED'
            ).aggregate(total=Sum('worker_earnings'))['total'] or 0

            return Response({
                'status': 'success',
                'data': {
                    'total_workers': workers.count(),
                    'delivery_stats': delivery_stats,
                    'recent_workers': recent_workers,
                    'total_revenue': total_revenue,
                }
            })

        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)