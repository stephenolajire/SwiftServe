from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from datetime import timedelta

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_('The Email field must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))

        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractBaseUser, PermissionsMixin):
    USER_TYPE_CHOICES = [
        ('INDIVIDUAL', 'Individual'),
        ('COMPANY', 'Company'),
        ('WORKER', 'Worker'),
    ]

    # Base fields required for authentication
    email = models.EmailField(_('email address'), unique=True)
    username = models.CharField(max_length=200, unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    # Common fields
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES)
    firstName = models.CharField(max_length=200)
    lastName = models.CharField(max_length=200)
    phoneNumber = models.CharField(max_length=15)
    dob = models.DateField(null=True, blank=True)
    address = models.CharField(max_length=200)
    city = models.CharField(max_length=200)
    state = models.CharField(max_length=200)
    country = models.CharField(max_length=200)
    postalCode = models.CharField(max_length=200)
    profileImage = models.ImageField(upload_to='profile_images/', null=True, blank=True)

    # Verification fields
    kyc_status = models.BooleanField(default=False)
    is_user_verified = models.BooleanField(default=False)
    
    # Location fields
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    # Company-specific fields
    company_name = models.CharField(max_length=200, null=True, blank=True)
    registration_number = models.CharField(max_length=200, null=True, blank=True)
    tax_id = models.CharField(max_length=20, null=True, blank=True)
    website_link = models.URLField(max_length=200, null=True, blank=True)
    bus_license = models.ImageField(upload_to='business_licenses/', null=True, blank=True)
    bus_certificate = models.ImageField(upload_to="business_certificates/", null=True, blank=True)

    # Worker-specific fields
    company = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'user_type': 'COMPANY'},
        related_name='workers'
    )

    # Deletion fields
    is_pending_deletion = models.BooleanField(default=False)
    scheduled_deletion_date = models.DateTimeField(null=True, blank=True)
    
    # ...existing code...
    
    def schedule_deletion(self):
        """Schedule account for deletion in 7 days"""
        self.is_pending_deletion = True
        self.scheduled_deletion_date = timezone.now() + timedelta(days=7)
        self.save()
    
    def cancel_deletion(self):
        """Cancel scheduled deletion"""
        self.is_pending_deletion = False
        self.scheduled_deletion_date = None
        self.save()

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'firstName', 'lastName']

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')

    def __str__(self):
        return self.email

    def get_full_name(self):
        return f"{self.firstName} {self.lastName}"

    def get_short_name(self):
        return self.firstName