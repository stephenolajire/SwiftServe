# from django.db import models
# from django.conf import settings
# from django.utils.translation import gettext_lazy as _

# class KYCVerification(models.Model):
#     """Base model for KYC verification"""
    
#     STATUS_CHOICES = [
#         ('PENDING', 'Pending'),
#         ('APPROVED', 'Approved'),
#         ('REJECTED', 'Rejected')
#     ]

#     DOCUMENT_TYPE_CHOICES = [
#         ('NATIONAL_ID', 'National ID'),
#         ('DRIVERS_LICENSE', 'Driver\'s License'),
#         ('PASSPORT', 'Passport'),
#         ('VOTERS_CARD', 'Voter\'s Card')
#     ]

#     user = models.OneToOneField(
#         settings.AUTH_USER_MODEL,
#         on_delete=models.CASCADE,
#         related_name='kyc'
#     )
#     document_type = models.CharField(
#         max_length=20, 
#         choices=DOCUMENT_TYPE_CHOICES
#     )
#     document_front = models.ImageField(
#         upload_to='kyc_documents/',
#         help_text=_('Front side of your ID document')
#     )
#     document_back = models.ImageField(
#         upload_to='kyc_documents/',
#         help_text=_('Back side of your ID document')
#     )
#     selfie_with_id = models.ImageField(
#         upload_to='kyc_documents/',
#         help_text=_('Selfie while holding your ID')
#     )
#     status = models.CharField(
#         max_length=10,
#         choices=STATUS_CHOICES,
#         default='PENDING'
#     )
#     verification_date = models.DateTimeField(
#         null=True, 
#         blank=True,
#         help_text=_('Date when KYC was verified')
#     )
#     rejection_reason = models.TextField(
#         null=True, 
#         blank=True,
#         help_text=_('Reason for rejection if KYC was rejected')
#     )
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     class Meta:
#         verbose_name = _('KYC Verification')
#         verbose_name_plural = _('KYC Verifications')

#     def __str__(self):
#         return f"KYC for {self.user.email} - {self.status}"

# class WorkerAdditionalKYC(models.Model):
#     """Additional KYC requirements for workers"""
    
#     kyc = models.OneToOneField(
#         KYCVerification,
#         on_delete=models.CASCADE,
#         related_name='worker_additional'
#     )
#     police_clearance = models.FileField(
#         upload_to='worker_documents/',
#         help_text=_('Police clearance certificate')
#     )
#     proof_of_address = models.FileField(
#         upload_to='worker_documents/',
#         help_text=_('Utility bill or lease agreement')
#     )
#     reference_letter = models.FileField(
#         upload_to='worker_documents/',
#         null=True,
#         blank=True,
#         help_text=_('Letter of recommendation (optional)')
#     )
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     class Meta:
#         verbose_name = _('Worker Additional KYC')
#         verbose_name_plural = _('Worker Additional KYCs')

#     def __str__(self):
#         return f"Additional KYC for {self.kyc.user.email}"