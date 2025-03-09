from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from datetime import date
from difflib import SequenceMatcher

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

    REVIEW_FLAGS = [
        ('NAME_MISMATCH', 'Name Mismatch'),
        ('AGE_VERIFICATION', 'Age Verification Needed'),
        ('ID_UNCLEAR', 'ID Document Unclear'),
        ('SELFIE_MISMATCH', 'Selfie Mismatch'),
        ('EXPIRED_ID', 'Expired ID Document'),
        ('OTHER', 'Other Issues')
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='kyc'
    )
    
    # Personal Information
    firstName = models.CharField(max_length=100)
    lastName = models.CharField(max_length=100)
    dateOfBirth = models.DateField()
    
    # ID Document
    idType = models.CharField(
        max_length=2,
        choices=IDType.choices,
        default=IDType.PASSPORT
    )
    idNumber = models.CharField(max_length=50)
    idDocument = models.ImageField(
        upload_to='kyc/id_documents/',
        help_text='Upload a clear image of your ID document'
    )
    selfieImage = models.ImageField(
        upload_to='kyc/selfies/',
        help_text='Take a clear selfie in good lighting'
    )
    idExpiryDate = models.DateField(
        null=True,
        blank=True,
        help_text='ID document expiry date'
    )
    
    # Verification Status
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='PENDING'
    )
    verificationDate = models.DateTimeField(auto_now_add=True)
    lastUpdated = models.DateTimeField(auto_now=True)
    reviewFlag = models.CharField(
        max_length=20,
        choices=REVIEW_FLAGS,
        null=True,
        blank=True
    )
    rejectionReason = models.TextField(blank=True, null=True)
    
    # Admin Review Fields
    reviewedBy = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='kyc_reviews'
    )
    reviewNotes = models.TextField(
        blank=True,
        null=True,
        help_text='Internal notes for review process'
    )
    
    # Name Matching Score
    nameSimilarityScore = models.FloatField(
        null=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )

    class Meta:
        verbose_name = 'KYC Verification'
        verbose_name_plural = 'KYC Verifications'
        indexes = [
            models.Index(fields=['status', 'verificationDate']),
            models.Index(fields=['user', 'status'])
        ]

    def __str__(self):
        return f"KYC for {self.user.email} - {self.status}"

    def initial_verification(self):
        """Perform initial automated checks"""
        try:
            # 1. Verify names match
            registration_name = f"{self.user.firstName} {self.user.lastName}".lower()
            kyc_name = f"{self.firstName} {self.lastName}".lower()
            
            self.nameSimilarityScore = SequenceMatcher(None, registration_name, kyc_name).ratio() * 100

            # 2. Verify age
            today = date.today()
            age = (
                today.year - self.dateOfBirth.year - 
                ((today.month, today.day) < (self.dateOfBirth.month, self.dateOfBirth.day))
            )

            # 3. Check ID expiry if provided
            is_id_valid = True
            if self.idExpiryDate and self.idExpiryDate < today:
                is_id_valid = False

            # 4. Set initial status based on automated checks
            if age < 18:
                self.status = 'REJECTED'
                self.reviewFlag = 'AGE_VERIFICATION'
                self.rejectionReason = "Must be 18 years or older"
            elif self.nameSimilarityScore < 80:
                self.status = 'PENDING'
                self.reviewFlag = 'NAME_MISMATCH'
            elif not is_id_valid:
                self.status = 'REJECTED'
                self.reviewFlag = 'EXPIRED_ID'
                self.rejectionReason = "ID document has expired"
            else:
                self.status = 'PENDING'

            self.save()
            return self.status != 'REJECTED'

        except Exception as e:
            self.status = 'INCOMPLETE'
            self.rejectionReason = f"Verification failed: {str(e)}"
            self.save()
            return False

    def clean(self):
        from django.core.exceptions import ValidationError
        errors = {}
        
        # Validate date of birth
        if self.dateOfBirth:
            today = date.today()
            age = (
                today.year - self.dateOfBirth.year - 
                ((today.month, today.day) < (self.dateOfBirth.month, self.dateOfBirth.day))
            )
            if age < 18:
                errors['dateOfBirth'] = "Must be at least 18 years old"

        # Validate ID expiry date
        if self.idExpiryDate and self.idExpiryDate < today:
            errors['idExpiryDate'] = "ID document has expired"

        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        self.clean()
        if not self.pk:  # New instance
            self.initial_verification()
        super().save(*args, **kwargs)