from rest_framework import serializers
from .models import KYCVerification
from django.core.exceptions import ValidationError
from datetime import date

class KYCVerificationSerializer(serializers.ModelSerializer):
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
            'idExpiryDate',
            'status',
            'verificationDate',
            'lastUpdated',
            'reviewFlag',
            'rejectionReason',
            'nameSimilarityScore'
        ]
        read_only_fields = [
            'status',
            'verificationDate',
            'lastUpdated',
            'reviewFlag',
            'rejectionReason',
            'nameSimilarityScore'
        ]

    def validate_dateOfBirth(self, value):
        """Validate date of birth - must be 18 or older"""
        today = date.today()
        age = (
            today.year - value.year - 
            ((today.month, today.day) < (value.month, value.day))
        )
        if age < 18:
            raise serializers.ValidationError("Must be at least 18 years old")
        return value

    def validate_idDocument(self, value):
        """Validate ID document file"""
        if value:
            # Check file size (max 5MB)
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("ID document must be less than 5MB")
            
            # Check file extension
            allowed_extensions = ['.jpg', '.jpeg', '.png', '.pdf']
            ext = value.name.lower().split('.')[-1]
            if f'.{ext}' not in allowed_extensions:
                raise serializers.ValidationError(
                    "Only JPG, JPEG, PNG and PDF files are allowed"
                )
        return value

    def validate_selfieImage(self, value):
        """Validate selfie image file"""
        if value:
            # Check file size (max 5MB)
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("Selfie image must be less than 5MB")
            
            # Check file extension
            allowed_extensions = ['.jpg', '.jpeg', '.png']
            ext = value.name.lower().split('.')[-1]
            if f'.{ext}' not in allowed_extensions:
                raise serializers.ValidationError(
                    "Only JPG, JPEG and PNG files are allowed"
                )
        return value

    def validate_idExpiryDate(self, value):
        """Validate ID expiry date"""
        if value and value < date.today():
            raise serializers.ValidationError("ID document has expired")
        return value

    def validate(self, data):
        """Additional validation for the entire object"""
        if not data.get('idDocument'):
            raise serializers.ValidationError({
                "idDocument": "ID document is required"
            })
            
        if not data.get('selfieImage'):
            raise serializers.ValidationError({
                "selfieImage": "Selfie image is required"
            })

        # Validate name fields
        for field in ['firstName', 'lastName']:
            if not data.get(field):
                raise serializers.ValidationError({
                    field: f"{field} is required"
                })
            # Check for valid characters in names
            if not data[field].replace(' ', '').isalpha():
                raise serializers.ValidationError({
                    field: f"{field} should only contain letters"
                })

        return data

    def to_representation(self, instance):
        """Customize the serialized representation"""
        data = super().to_representation(instance)
        
        # Add URLs for documents if they exist
        if instance.idDocument:
            data['idDocument_url'] = instance.idDocument.url
        if instance.selfieImage:
            data['selfieImage_url'] = instance.selfieImage.url
            
        # Format dates
        if data.get('dateOfBirth'):
            data['dateOfBirth'] = instance.dateOfBirth.strftime('%Y-%m-%d')
        if data.get('idExpiryDate'):
            data['idExpiryDate'] = instance.idExpiryDate.strftime('%Y-%m-%d')
        if data.get('verificationDate'):
            data['verificationDate'] = instance.verificationDate.strftime('%Y-%m-%d %H:%M:%S')
        if data.get('lastUpdated'):
            data['lastUpdated'] = instance.lastUpdated.strftime('%Y-%m-%d %H:%M:%S')

        return data

class KYCAdminSerializer(KYCVerificationSerializer):
    """Serializer for admin users with additional fields"""
    reviewedBy = serializers.StringRelatedField(read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta(KYCVerificationSerializer.Meta):
        fields = KYCVerificationSerializer.Meta.fields + [
            'reviewedBy',
            'reviewNotes',
            'user_email'
        ]
        read_only_fields = list(set(
            KYCVerificationSerializer.Meta.read_only_fields + 
            ['reviewedBy', 'user_email']
        ))