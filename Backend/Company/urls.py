from django.urls import path
from .views import CompanyWorkersView

urlpatterns = [
    path('company/workers/', CompanyWorkersView.as_view(), name='company-workers'),
]