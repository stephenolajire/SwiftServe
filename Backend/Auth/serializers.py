from rest_framework import serializers
from .models import CustomUser
import re
from datetime import datetime
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from .models import CustomUser

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['user_type'] = user.user_type
        token['kyc_status'] = user.kyc_status
        token['is_superuser'] = user.is_superuser
        token['is_staff'] = user.is_staff
        
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add extra responses
        data['user_type'] = self.user.user_type
        data['kyc_status'] = self.user.kyc_status
        data['is_superuser'] = self.user.is_superuser
        data['is_staff'] = self.user.is_staff
        data['email'] = self.user.email
        data['username'] = self.user.username
        
        return data

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
    """Serializer for worker registration"""
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
            'vehicleType',
            'vehiclePlateNumber',
            'vehicleRegistration',
            'driversLicense',
            'company'  # Add company field
        ]

    def validate_email(self, value):
        if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', value):
            raise serializers.ValidationError("Invalid email format")
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered")
        return value

    def validate_phoneNumber(self, value):
        if not re.match(r'^\+?[0-9]{8,15}$', value.replace(' ', '')):
            raise serializers.ValidationError("Invalid phone number format")
        return value

    def validate_vehiclePlateNumber(self, value):
        if not value or len(value) < 6:
            raise serializers.ValidationError("Invalid vehicle plate number")
        return value

    def validate_dob(self, value):
        try:
            age = (datetime.now().date() - value).days // 365
            if age < 18:
                raise serializers.ValidationError("Worker must be at least 18 years old")
        except Exception:
            raise serializers.ValidationError("Invalid date format")
        return value

    def validate(self, data):
        errors = {}
        
        # Required fields validation
        required_fields = {
            'email': 'Email',
            'username': 'Username',
            'password': 'Password',
            'firstName': 'First name',
            'lastName': 'Last name',
            'phoneNumber': 'Phone number',
            'dob': 'Date of birth',
            'address': 'Address',
            'city': 'City',
            'state': 'State',
            'country': 'Country',
            'localGovernment': 'Local Government',
            'vehicleType': 'Vehicle type',
            'vehiclePlateNumber': 'Vehicle plate number'
        }

        for field, label in required_fields.items():
            if not data.get(field):
                errors[field] = f"{label} is required"

        # Document validation
        required_documents = {
            'vehicleRegistration': 'Vehicle registration',
            'driversLicense': 'Driver\'s license'
        }

        for field, label in required_documents.items():
            if field not in data or not data[field]:
                errors[field] = f"{label} document is required"
            elif hasattr(data[field], 'size'):
                if data[field].size > 5 * 1024 * 1024:  # 5MB limit
                    errors[field] = f"{label} file size must be less than 5MB"

        if errors:
            raise serializers.ValidationError(errors)

        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        
        # Generate username if not provided
        if 'username' not in validated_data:
            base_username = f"{validated_data['firstName'].lower()}{validated_data['lastName'].lower()}"
            username = base_username
            counter = 1
            while CustomUser.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            validated_data['username'] = username

        # Ensure user type is WORKER
        validated_data['user_type'] = 'WORKER'
        
        user = CustomUser.objects.create(**validated_data)
        user.set_password(password)
        user.save()

        return user