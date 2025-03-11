from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from datetime import date, datetime
import os


class IDType(models.TextChoices):
    DRIVERS_LICENSE = 'DL', 'Driver\'s License'
    PASSPORT = 'PP', 'International Passport'
    VOTERS_CARD = 'VC', 'Voter\'s Card'
    NATIONAL_ID = 'NI', 'National ID'

class KYCVerification(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending Review'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('INCOMPLETE', 'Incomplete Documentation')
    ]

    # User Reference
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='kyc'
    )

    # Personal Information
    firstName = models.CharField(max_length=100)
    lastName = models.CharField(max_length=100)
    dateOfBirth = models.DateField()

    # ID Document Information
    idType = models.CharField(
        max_length=2,
        choices=IDType.choices,
        default=IDType.PASSPORT
    )
    idNumber = models.CharField(max_length=50)
    idDocument = models.ImageField(
        upload_to='ID',
        help_text='Upload a clear image of your ID document'
    )
    selfieImage = models.ImageField(
        upload_to='selfie',
        help_text='Take a clear selfie in good lighting'
    )

    # Verification Status
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='PENDING'
    )
    verificationDate = models.DateTimeField(auto_now_add=True)
    lastUpdated = models.DateTimeField(auto_now=True)
    rejectionReason = models.TextField(blank=True, null=True)

    # Metadata
    createdAt = models.DateTimeField(default=datetime.now)
    updatedAt = models.DateTimeField( default=datetime.now)

    class Meta:
        verbose_name = 'KYC Verification'
        verbose_name_plural = 'KYC Verifications'
        # ordering = ['-createdAt']
        indexes = [
            models.Index(fields=['status', 'verificationDate']),
            models.Index(fields=['user', 'status'])
        ]

    def __str__(self):
        return f"KYC for {self.user.email} - {self.status}"

    def clean(self):
        from django.core.exceptions import ValidationError
        
        # Validate age (must be 18 or older)
        if self.dateOfBirth:
            today = date.today()
            age = (
                today.year - self.dateOfBirth.year - 
                ((today.month, today.day) < (self.dateOfBirth.month, self.dateOfBirth.day))
            )
            if age < 18:
                raise ValidationError("Must be at least 18 years old")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        # Clean up files when deleting KYC
        if self.idDocument:
            if os.path.isfile(self.idDocument.path):
                os.remove(self.idDocument.path)
        if self.selfieImage:
            if os.path.isfile(self.selfieImage.path):
                os.remove(self.selfieImage.path)
        super().delete(*args, **kwargs)