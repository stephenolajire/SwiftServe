from django.urls import path
from . import views

urlpatterns = [
    # Stats and Overview
    path('admin/stats/', views.get_stats, name='admin-stats'),
    
    # User Management
    path('admin/users/', views.get_users, name='admin-users'),
    path('admin/users/<str:user_id>/', views.get_user_details, name='user-details'),
    path('admin/users/<int:user_id>/<str:action>/', views.handle_user_action, name='user-action'),
     path('admin/user-activity/', views.get_user_activity, name='user-activity'),
    
    # KYC Management
    path('admin/kyc-requests/', views.get_kyc_requests, name='kyc-requests'),
    path('admin/kyc/<int:user_id>/<str:action>', views.handle_kyc_action, name='kyc-action'),
]