# from django.contrib import admin
# from .models import KYCVerification, WorkerAdditionalKYC

# @admin.register(KYCVerification)
# class KYCVerificationAdmin(admin.ModelAdmin):
#     list_display = ['user', 'document_type', 'status', 'verification_date']
#     list_filter = ['status', 'document_type']
#     search_fields = ['user__email']
#     readonly_fields = ['created_at', 'updated_at']

# @admin.register(WorkerAdditionalKYC)
# class WorkerAdditionalKYCAdmin(admin.ModelAdmin):
#     list_display = ['kyc', 'created_at']
#     search_fields = ['kyc__user__email']
#     readonly_fields = ['created_at', 'updated_at']