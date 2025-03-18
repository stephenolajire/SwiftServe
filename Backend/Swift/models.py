from django.db import models
from Auth.models import CustomUser
from django.core.validators import MinValueValidator
from django.core.validators import MinValueValidator, FileExtensionValidator

class Delivery(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted'),
        ('PICKED_UP', 'Picked Up'),
        ('IN_TRANSIT', 'In Transit'),
        ('DELIVERED', 'Delivered'),
        ('CANCELLED', 'Cancelled')
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

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Deliveries'

    def __str__(self):
        return f"Delivery {self.id} - {self.itemName}"