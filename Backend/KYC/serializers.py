from rest_framework import serializers
from .models import KYCVerification
from django.core.exceptions import ValidationError
from datetime import date

class KYCVerificationSerializer(serializers.ModelSerializer):
    """
    Serializer for KYC verification submission and retrieval
    """
    class Meta:
        model = KYCVerification
        fields = [
            'firstName',
            'lastName',
            'dateOfBirth',
            'idType',
            'idNumber',
            'idDocument',
            'selfieImage',
            'status',
            'verificationDate',
            'lastUpdated',
            'rejectionReason'
        ]
        read_only_fields = [
            'status',
            'verificationDate',
            'lastUpdated',
            'rejectionReason'
        ]

    def validate_dateOfBirth(self, value):
        """
        Check that the user is at least 18 years old
        """
        today = date.today()
        age = (
            today.year - value.year - 
            ((today.month, today.day) < (value.month, value.day))
        )
        if age < 18:
            raise serializers.ValidationError("Must be at least 18 years old")
        return value

    def validate_idDocument(self, value):
        """
        Validate ID document file size and type
        """
        if value:
            if value.size > 5 * 1024 * 1024:  # 5MB limit
                raise serializers.ValidationError("ID document must be less than 5MB")
            
            allowed_types = ['image/jpeg', 'image/png', 'image/jpg']
            if value.content_type not in allowed_types:
                raise serializers.ValidationError(
                    "Only JPG, JPEG and PNG files are allowed for ID document"
                )
        return value

    def validate_selfieImage(self, value):
        """
        Validate selfie image file size and type
        """
        if value:
            if value.size > 5 * 1024 * 1024:  # 5MB limit
                raise serializers.ValidationError("Selfie image must be less than 5MB")
            
            allowed_types = ['image/jpeg', 'image/png', 'image/jpg']
            if value.content_type not in allowed_types:
                raise serializers.ValidationError(
                    "Only JPG, JPEG and PNG files are allowed for selfie"
                )
        return value

    def validate(self, data):
        """
        Validate the complete data set
        """
        # Check required fields
        required_fields = ['firstName', 'lastName', 'dateOfBirth', 'idType', 'idNumber']
        for field in required_fields:
            if field not in data:
                raise serializers.ValidationError({
                    field: f"{field} is required"
                })

        # Validate name fields contain only letters and spaces
        for field in ['firstName', 'lastName']:
            if not all(char.isalpha() or char.isspace() for char in data[field]):
                raise serializers.ValidationError({
                    field: f"{field} should only contain letters and spaces"
                })

        return data

    def create(self, validated_data):
        """
        Create and return a new KYC verification instance
        """
        user = self.context['request'].user
        kyc = KYCVerification.objects.create(user=user, **validated_data)
        return kyc

    def to_representation(self, instance):
        """
        Customize the output representation
        """
        data = super().to_representation(instance)
        
        # Add URLs for documents if they exist
        if instance.idDocument:
            data['idDocument_url'] = self.context['request'].build_absolute_uri(
                instance.idDocument.url
            )
        if instance.selfieImage:
            data['selfieImage_url'] = self.context['request'].build_absolute_uri(
                instance.selfieImage.url
            )

        # Format dates
        if data.get('dateOfBirth'):
            data['dateOfBirth'] = instance.dateOfBirth.strftime('%Y-%m-%d')
        if data.get('verificationDate'):
            data['verificationDate'] = instance.verificationDate.strftime('%Y-%m-%d %H:%M:%S')
        if data.get('lastUpdated'):
            data['lastUpdated'] = instance.lastUpdated.strftime('%Y-%m-%d %H:%M:%S')

        return data
    

