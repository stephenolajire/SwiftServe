from rest_framework import serializers
from .models import CustomUser
import re
from datetime import datetime

class CompanyUserSerializer(serializers.ModelSerializer):
    """Serializer for company registration"""
    password = serializers.CharField(write_only=True)
    # confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = CustomUser
        fields = [
            'email',
            'password',
            # 'confirm_password',
            'companyName',
            'registrationNumber',
            'taxId',
            'website',
            'country',
            'cacNumber',
            'contactName',
            'phoneNumber',
            'address',
            'city',
            'state',
            'postalCode',
            'fleetSize',
            'fleetType',
            'businessLicense',
            'insuranceCert',
            'cacCertificate',
            'taxClearance',
        ]

    def validate_email(self, value):
        if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', value):
            raise serializers.ValidationError("Invalid email format")
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered")
        return value

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters")
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Must contain an uppercase letter")
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError("Must contain a lowercase letter")
        if not re.search(r'[0-9]', value):
            raise serializers.ValidationError("Must contain a number")
        if not re.search(r'[^A-Za-z0-9]', value):
            raise serializers.ValidationError("Must contain a special character")
        return value

    def validate_phoneNumber(self, value):
        if not re.match(r'^\+?[0-9]{8,15}$', value.replace(' ', '')):
            raise serializers.ValidationError("Invalid phone number format")
        return value

    def validate_fleetSize(self, value):
        try:
            fleet_size = int(value)
            if fleet_size < 1:
                raise serializers.ValidationError("Must have at least 1 vehicle")
        except (TypeError, ValueError):
            raise serializers.ValidationError("Must be a valid number")
        return value

    def validate(self, data):
        errors = {}

        # Password confirmation
        # if data.get('password') != data.get('confirm_password'):
        #     errors['password'] = "Passwords do not match"

        # Required fields validation
        required_fields = {
            'email': 'Email',
            'password': 'Password',
            'companyName': 'Company name',
            'registrationNumber': 'Registration number',
            'taxId': 'Tax ID',
            'country': 'Country',
            'contactName': 'Contact name',
            'phoneNumber': 'Phone number',
            'address': 'Address',
            'city': 'City',
            'state': 'State',
            'postalCode': 'Postal code',
            'fleetSize': 'Fleet size',
            'fleetType': 'Fleet type',
            'businessLicense': 'Business license',
            'insuranceCert': 'Insurance certificate'
        }

        for field, label in required_fields.items():
            if not data.get(field):
                errors[field] = f"{label} is required"

        # Special validation for Nigerian companies
        if data.get('country') == 'Nigeria':
            if not data.get('cacNumber'):
                errors['cacNumber'] = "CAC number is required for Nigerian companies"
            if not data.get('cacCertificate'):
                errors['cacCertificate'] = "CAC certificate is required for Nigerian companies"

        # Document size validation
        document_fields = ['businessLicense', 'insuranceCert', 'cacCertificate', 'taxClearance']
        max_size = 5 * 1024 * 1024  # 5MB

        for field in document_fields:
            if field in data and data[field]:
                if hasattr(data[field], 'size') and data[field].size > max_size:
                    errors[field] = "File size must be less than 5MB"

        if errors:
            raise serializers.ValidationError(errors)

        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password', None)
        password = validated_data.pop('password')

        # Generate username from company name
        company_name = validated_data['companyName']
        username = re.sub(r'[^a-zA-Z0-9]', '', company_name).lower()
        if CustomUser.objects.filter(username=username).exists():
            username = f"{username}{CustomUser.objects.count()}"

        validated_data['username'] = username
        validated_data['user_type'] = 'COMPANY'
        
        user = CustomUser.objects.create(**validated_data)
        user.set_password(password)
        user.save()

        return user


class IndividualSerializer(serializers.ModelSerializer):
    """Serializer for individual and worker registration"""
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = CustomUser
        fields = [
            'email',
            'username',
            'password',
            'firstName',
            'lastName',
            'phoneNumber',
            'dob',
            'address',
            'city',
            'state',
            'country',
            'postalCode',
            'profileImage',
            'user_type',
            'latitude',
            'longitude',
            'localGovernment'
        ]
    
    def validate_email(self, value):
        if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', value):
            raise serializers.ValidationError("Invalid email format")
        return value
    
    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters")
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Must contain an uppercase letter")
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError("Must contain a lowercase letter")
        if not re.search(r'[0-9]', value):
            raise serializers.ValidationError("Must contain a number")
        if not re.search(r'[^A-Za-z0-9]', value):
            raise serializers.ValidationError("Must contain a special character")
        return value
    
    def validate_phoneNumber(self, value):
        if not re.match(r'^\+?[0-9]{8,15}$', value):
            raise serializers.ValidationError("Invalid phone number")
        return value
    
    def validate_dob(self, value):
        age = (datetime.now().date() - value).days // 365
        if age < 18:
            raise serializers.ValidationError("Must be at least 18 years old")
        return value

    def validate(self, data):
        required_fields = [
            'email', 'username', 'password', 'firstName', 
            'lastName', 'phoneNumber', 'dob', 'address',
            'city', 'state', 'country', 'postalCode',
            'latitude', 'longitude', 'user_type', 'localGovernment'
        ]
        
        for field in required_fields:
            if not data.get(field):
                raise serializers.ValidationError({
                    field: f"{field.replace('_', ' ').title()} is required"
                })
        
        # Handle optional profile image
        if 'profileImage' in data and data['profileImage'] is None:
            data.pop('profileImage')
            
        
        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        
        # Create user instance
        user = CustomUser.objects.create(**validated_data)
        user.set_password(password)
        user.save()

        return user
    

class WorkersSerializer(serializers.ModelSerializer):
    """Serializer for individual and worker registration"""
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = CustomUser
        fields = [
            'email',
            'username',
            'password',
            'firstName',
            'lastName',
            'phoneNumber',
            'dob',
            'address',
            'city',
            'state',
            'country',
            'postalCode',
            'profileImage',
            'user_type',
            'localGovernment',
        ]

    def validate(self, data):

        # Validate required personal information
        required_fields = [ 'email',
            'username',
            'password',
            'firstName',
            'lastName',
            'phoneNumber',
            'dob',
            'address',
            'city',
            'state',
            'country',
            'postalCode',
            'profileImage',
            'user_type',
            'localGovernment',]
        for field in required_fields:
            if not data.get(field):
                raise serializers.ValidationError({
                    field: f"{field.replace('_', ' ').title()} is required"
                })

    def create(self, validated_data):
        # Remove confirm_password from validated data
        validated_data.pop('confirm_password', None)
        password = validated_data.pop('password')
        
        # Create user instance
        user = CustomUser.objects.create(**validated_data)
        user.set_password(password)
        user.save()

        return user