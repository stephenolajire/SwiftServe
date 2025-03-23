from django.db import models
from Auth.models import CustomUser
from django.core.validators import MinValueValidator, MaxValueValidator, FileExtensionValidator
import json
from django.utils import timezone

class Delivery(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted'),
        ('PICKED_UP', 'Picked Up'),
        ('IN_TRANSIT', 'In Transit'),
        ('DELIVERED', 'Delivered'),
        ('CANCELLED', 'Cancelled'),
        ('RECEIVED', 'Received')
    ]

    CATEGORY_CHOICES = [
        ('documents', 'Documents'),
        ('electronics', 'Electronics'),
        ('clothing', 'Clothing'),
        ('food', 'Food'),
        ('other', 'Other')
    ]

    # Package Information
    itemName = models.CharField(max_length=100)
    itemDescription = models.TextField()
    itemImage = models.ImageField(
        upload_to='delivery_images/%Y/%m/',
        validators=[
            FileExtensionValidator(['jpg', 'jpeg', 'png', 'heic']),
        ],
        null=True,
        blank=True,
        default='default_delivery.png'
    )
    weight = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        validators=[MinValueValidator(0.01)]
    )
    length = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        null=True, 
        blank=True
    )
    width = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        null=True, 
        blank=True
    )
    height = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        null=True, 
        blank=True
    )
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES
    )
    fragile = models.BooleanField(default=False)
    specialInstructions = models.TextField(blank=True)

    # Pickup Details
    pickupAddress = models.CharField(max_length=255)
    pickupLg = models.CharField(max_length=200)
    pickupCity = models.CharField(max_length=100)
    pickupState = models.CharField(max_length=100)
    pickupDate = models.DateField()
    pickupTime = models.TimeField()
    pickupContactName = models.CharField(max_length=100)
    pickupContactPhone = models.CharField(max_length=15)
    pickupInstructions = models.TextField(blank=True)

    # Delivery Details
    deliveryAddress = models.CharField(max_length=255)
    deliveryCity = models.CharField(max_length=100)
    deliveryState = models.CharField(max_length=100)
    recipientName = models.CharField(max_length=100)
    recipientPhone = models.CharField(max_length=15)
    recipientEmail = models.EmailField(blank=True)
    deliveryInstructions = models.TextField(blank=True)

    # Metadata
    client = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE,
        related_name='deliveries'
    )
    worker = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_deliveries'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    estimated_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )
    completed_at = models.DateTimeField(null=True, blank=True)
    worker_earnings = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True
    )
    rating = models.DecimalField(
        max_digits=3, 
        decimal_places=1, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )

    # Add this field to store last read timestamps for each user
    _last_read = models.TextField(default='{}', db_column='last_read')

    current_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    current_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    location_updated_at = models.DateTimeField(null=True, blank=True)

    transit_start_time = models.DateTimeField(null=True, blank=True)
    delivery_completed_at = models.DateTimeField(null=True, blank=True)

    distance_covered = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Distance covered in kilometers"
    )
    base_price_per_km = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=100.00,  # Default base price per km in Naira
    )

    payment_status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', 'Pending'),
            ('PROCESSING', 'Processing'),
            ('COMPLETED', 'Completed'),
            ('FAILED', 'Failed')
        ],
        default='PENDING'
    )
    payment_reference = models.CharField(max_length=100, null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    @property
    def last_read(self):
        try:
            return json.loads(self._last_read)
        except:
            return {}

    @last_read.setter
    def last_read(self, value):
        self._last_read = json.dumps(value)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Deliveries'

    def __str__(self):
        return f"Delivery {self.id} - {self.itemName}"

    # Add a method to validate status transitions
    def can_transition_to(self, new_status):
        valid_transitions = {
            'ACCEPTED': ['IN_TRANSIT'],
            'IN_TRANSIT': ['DELIVERED'],
        }
        return new_status in valid_transitions.get(self.status, [])

    def calculate_final_price(self):
        """Calculate final price based on distance and base rate"""
        base_price = float(self.distance_covered) * float(self.base_price_per_km)
        
        # Add additional charges based on weight if applicable
        weight_charge = 0
        if self.weight > 10:  # If weight is more than 10kg
            weight_charge = (self.weight - 10) * 50  # ₦50 per kg over 10kg

        # Add fragile item handling charge if applicable
        fragile_charge = 500 if self.fragile else 0

        return base_price + weight_charge + fragile_charge

class ChatMessage(models.Model):
    MESSAGE_TYPES = [
        ('VERIFICATION', 'Verification'),
        ('GENERAL', 'General'),
    ]

    delivery = models.ForeignKey('Delivery', on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey('Auth.CustomUser', on_delete=models.CASCADE)
    sender_type = models.CharField(max_length=10)  # WORKER or CLIENT
    message = models.TextField(null=True, blank=True)
    image = models.ImageField(upload_to='chat_images/', null=True, blank=True)
    type = models.CharField(max_length=20, choices=MESSAGE_TYPES, default='GENERAL')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']