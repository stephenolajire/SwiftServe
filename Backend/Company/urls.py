from django.urls import path
from .views import*

urlpatterns = [
    path('dashboard/overview/', DashboardOverviewView.as_view(), name='company-workers'),
    
]