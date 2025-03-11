from django.urls import path
from .views import KYCSubmissionView

urlpatterns = [
    path('kyc/submit/', KYCSubmissionView.as_view(), name='kyc-submit'),
    # path('kyc/status/', KYCStatusView.as_view(), name='kyc-status'),
    # path('kyc/update/', KYCUpdateView.as_view(), name='kyc-update'),
]