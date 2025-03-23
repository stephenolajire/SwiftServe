from django.urls import path
from .views import *

urlpatterns = [
    path('register/company/', CompanyRegistrationView.as_view(), name='register_company'),
    path('register/individual/', IndividualRegistrationView.as_view(), name='register_individual'),
    path('register/worker/', WorkerRegistrationView.as_view(), name='register_worker'),
    path('company/workers/', CompanyWorkersView.as_view(), name='list_workers'),
    path('request-verification/', RequestVerificationView.as_view(), name='request-verification'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('verify-reset-otp/', VerifyResetOTPView.as_view(), name='verify-reset-otp'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('listuser/', ListUserView.as_view())
]