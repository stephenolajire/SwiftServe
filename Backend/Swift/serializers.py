from decimal import Decimal
from rest_framework import serializers
from .models import Delivery, ChatMessage
from django.utils import timezone
from django.core.validators import FileExtensionValidator
from django.core.files.images import get_image_dimensions

class DeliverySerializer(serializers.ModelSerializer):
    # Add decimal field validation for weight
    weight = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        min_value=Decimal('0.01')
    )

    # Add decimal field validations for dimensions
    length = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        min_value=Decimal('0.01'),
        required=False
    )
    width = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        min_value=Decimal('0.01'),
        required=False
    )
    height = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        min_value=Decimal('0.01'),
        required=False
    )

    status_display = serializers.CharField(source='get_status_display', read_only=True)
    client_name = serializers.SerializerMethodField(read_only=True)
    worker_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Delivery
        fields = [
            # Package Information
            'id', 'itemName', 'itemDescription', 'weight',
            'length', 'width', 'height', 'category',
            'fragile', 'specialInstructions', 'itemImage',
            
            # Pickup Details
            'pickupAddress', 'pickupLg', 'pickupCity', 'pickupState',
            'pickupDate', 'pickupTime', 'pickupContactName',
            'pickupContactPhone', 'pickupInstructions',
            
            # Delivery Details
            'deliveryAddress', 'deliveryCity', 'deliveryState',
            'recipientName', 'recipientPhone', 'recipientEmail',
            'deliveryInstructions',
            
            # Metadata
            'status', 'status_display', 'client', 'client_name',
            'worker', 'worker_name',
            'created_at', 'updated_at','payment_status'
        ]
        read_only_fields = [
            'client', 'worker', 'status', 'created_at',
            'updated_at', 'estimated_price', 'status_display'
        ]

    def get_client_name(self, obj):
        return f"{obj.client.firstName} {obj.client.lastName}" if obj.client else None

    def get_worker_name(self, obj):
        return f"{obj.worker.firstName} {obj.worker.lastName}" if obj.worker else None

    def validate_itemImage(self, value):
        if value:
            # Check file size
            if value.size > 5 * 1024 * 1024:  # 5MB limit
                raise serializers.ValidationError(
                    "Image file too large. Size should not exceed 5MB."
                )

            # Check file extension
            allowed_extensions = ['jpg', 'jpeg', 'png', 'heic']
            ext = value.name.split('.')[-1].lower()
            if ext not in allowed_extensions:
                raise serializers.ValidationError(
                    f"Unsupported file extension. Use: {', '.join(allowed_extensions)}"
                )

            # Check image dimensions
            width, height = get_image_dimensions(value)
            if width > 4096 or height > 4096:
                raise serializers.ValidationError(
                    "Image dimensions too large. Maximum size is 4096x4096 pixels."
                )

            return value

    def validate(self, data):
        errors = {}

        # Validate dimensions
        dimensions = ['length', 'width', 'height']
        if any(dim in data for dim in dimensions):
            if not all(dim in data for dim in dimensions):
                errors['dimensions'] = "All dimensions (length, width, height) must be provided together"

        # Validate pickup date and time
        if 'pickupDate' in data and 'pickupTime' in data:
            try:
                pickup_datetime = timezone.datetime.combine(
                    data['pickupDate'],
                    data['pickupTime']
                )
                # Make the datetime timezone-aware
                pickup_datetime = timezone.make_aware(pickup_datetime)
                
                # Get current time (timezone-aware)
                current_time = timezone.now()
                
                # Compare timezone-aware datetimes
                if pickup_datetime < current_time:
                    errors['pickup_datetime'] = "Pickup date and time must be in the future"
                    
            except (ValueError, TypeError) as e:
                errors['pickup_datetime'] = "Invalid date or time format"

        # Add image validation to general validation
        if 'itemImage' in data and data['itemImage']:
            try:
                self.validate_itemImage(data['itemImage'])
            except serializers.ValidationError as e:
                errors['itemImage'] = e.detail

        if errors:
            raise serializers.ValidationError(errors)

        return data

    def create(self, validated_data):
        user = self.context['request'].user
        
        if not user.is_authenticated:
            raise serializers.ValidationError("Authentication required to create delivery")
        if user.user_type != 'CLIENT':
            raise serializers.ValidationError("Only clients can create deliveries")

        # Handle image upload
        if 'itemImage' in validated_data:
            image = validated_data['itemImage']
            if image:
                # Generate unique filename
                ext = image.name.split('.')[-1].lower()
                validated_data['itemImage'].name = f"delivery_{timezone.now().strftime('%Y%m%d_%H%M%S')}.{ext}"

        validated_data['client'] = user
        validated_data['status'] = 'PENDING'
        
        # Calculate estimated price
        # def calculate_estimated_price(self, data):
        #     try:
        #         # Base calculations
        #         base_price = Decimal('1000')  # Base service fee
        #         weight_factor = Decimal(str(data.get('weight', 0))) * Decimal('10')  # ₦10 per kg
        #         fragile_charge = Decimal('500') if data.get('fragile', False) else Decimal('0')

        #         # Initial estimated price without distance
        #         initial_price = base_price + weight_factor + fragile_charge

        #         # Set estimated_price field to initial calculation
        #         # Final price will be updated when delivery is in transit
        #         return round(initial_price, 2)
        #     except (TypeError, ValueError) as e:
        #         raise serializers.ValidationError(f"Error calculating price: {str(e)}")

        # def update_final_price(self, distance_km):
        #     """
        #     Updates the final price when delivery is in transit
        #     distance_km: float - distance in kilometers
        #     """
        #     try:
        #         # Convert distance to Decimal and calculate
        #         distance = Decimal(str(distance_km))
        #         distance_factor = distance * Decimal('100')  # ₦100 per km
                
        #         # Get existing price components
        #         base_price = self.estimated_price or Decimal('0')
                
        #         # Calculate final price
        #         final_price = base_price + distance_factor
                
        #         return round(final_price, 2)
        #     except (TypeError, ValueError) as e:
        #         raise serializers.ValidationError(f"Error calculating final price: {str(e)}")

class ChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatMessage
        fields = [
            'id', 'delivery', 'sender_type', 'sender_name',
            'message', 'image', 'type', 'created_at'
        ]
        read_only_fields = ['sender_type', 'sender_name']

    def get_sender_name(self, obj):
        return f"{obj.sender.firstName} {obj.sender.lastName}"