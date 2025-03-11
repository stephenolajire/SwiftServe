from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from datetime import timedelta

class CustomUserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, username, password, **extra_fields)

class CustomUser(AbstractBaseUser, PermissionsMixin):
    USER_TYPE_CHOICES = [
        ('INDIVIDUAL', 'Individual'),
        ('COMPANY', 'Company'),
        ('WORKER', 'Worker'),
    ]

    # Base Authentication Fields
    email = models.EmailField(_('email address'), unique=True)
    username = models.CharField(max_length=200, unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES)
    firstName = models.CharField(max_length=200)
    lastName = models.CharField(max_length=200)
    dob = models.DateField(null=True, blank=True)
    profileImage = models.ImageField(upload_to='profile_images/', null=True, blank=True)
    localGovernment = models.CharField(max_length=200, default="")

    # Company Information Fields
    companyName = models.CharField(max_length=200, null=True, blank=True)
    registrationNumber = models.CharField(max_length=200, null=True, blank=True)
    taxId = models.CharField(max_length=20, null=True, blank=True)
    website = models.URLField(max_length=200, null=True, blank=True)
    country = models.CharField(max_length=200, null=True, blank=True)
    cacNumber = models.CharField(max_length=200, null=True, blank=True)

    # Contact Information Fields
    contactName = models.CharField(max_length=200, null=True, blank=True)
    phoneNumber = models.CharField(max_length=15, null=True, blank=True)

    # Address Information Fields
    address = models.CharField(max_length=200, null=True, blank=True)
    city = models.CharField(max_length=200, null=True, blank=True)
    state = models.CharField(max_length=200, null=True, blank=True)
    postalCode = models.CharField(max_length=200, null=True, blank=True)

    # Fleet Information Fields
    fleetSize = models.IntegerField(null=True, blank=True)
    fleetType = models.CharField(max_length=200, null=True, blank=True)

    # Document Fields
    businessLicense = models.ImageField(upload_to='business_licenses/', null=True, blank=True)
    insuranceCert = models.ImageField(upload_to='insurance_certificates/', null=True, blank=True)
    cacCertificate = models.ImageField(upload_to='cac_certificates/', null=True, blank=True)
    taxClearance = models.ImageField(upload_to='tax_clearance/', null=True, blank=True)

    # Verification Fields
    kyc_status = models.BooleanField(default=False)
    is_user_verified = models.BooleanField(default=False)

    # Location Fields (for future use)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    # Worker Relationship Field
    company = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'user_type': 'COMPANY'},
        related_name='workers'
    )

    # Account Status Fields
    is_pending_deletion = models.BooleanField(default=False)
    scheduled_deletion_date = models.DateTimeField(null=True, blank=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')

    def __str__(self):
        if self.user_type == 'COMPANY':
            return f"{self.companyName} ({self.email})"
        return self.email

    def get_full_name(self):
        return self.contactName if self.user_type == 'COMPANY' else f"{self.firstName} {self.lastName}"

    def get_short_name(self):
        return self.companyName if self.user_type == 'COMPANY' else self.firstName