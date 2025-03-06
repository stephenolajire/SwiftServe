from rest_framework import serializers
from .models import CustomUser
import re
from datetime import datetime

class CompanyUserSerializer(serializers.ModelSerializer):
    """Serializer for company registration"""
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = CustomUser
        fields = [
            'email',
            'password',
            'company_name',
            'registration_number',
            'tax_id',
            'website_link',
            'bus_license',
            'bus_certificate',
            'country'
        ]

    def validate(self, data):
        # Validate password match
        if data.get('password') != data.get('confirm_password'):
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })

        # Validate required company fields
        required_fields = ['company_name', 'registration_number', 'tax_id']
        for field in required_fields:
            if not data.get(field):
                raise serializers.ValidationError({
                    field: f"{field.replace('_', ' ').title()} is required"
                })

        return data

    def create(self, validated_data):
        # Remove confirm_password from validated data
        validated_data.pop('confirm_password', None)
        password = validated_data.pop('password')

        # Set user type to COMPANY
        validated_data['user_type'] = 'COMPANY'
        
        # Create user instance
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
            'longitude'
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
            'latitude', 'longitude', 'user_type'
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
        ]

    def validate(self, data):

        # Validate required personal information
        required_fields = ['firstname', 'last_name', 'phonenumber', 'address']
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