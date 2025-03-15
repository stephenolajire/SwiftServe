from rest_framework import serializers
from Auth.models import CustomUser
from KYC.models import KYCVerification
from .models import AdminStats, RevenueData, UserActivity

class AdminStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminStats
        fields = '__all__'

class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'firstName', 'lastName', 'user_type', 
                 'is_user_verified', 'date_joined', 'kyc_status']

class KYCRequestSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email')
    
    class Meta:
        model = KYCVerification
        fields = ['id', 'user_id', 'user_email', 'firstName', 'lastName',
                 'idType', 'status', 'createdAt', 'idDocument', 'selfieImage']

class RevenueDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = RevenueData
        fields = '__all__'

class UserActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserActivity
        fields = '__all__'

class UserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'firstName', 'lastName', 'user_type',
            'kyc_status', 'is_active', 'date_joined', 'phoneNumber',
            'address', 'city', 'state', 'postalCode',
            # Company fields
            'companyName', 'registrationNumber', 'taxId', 'website',
            'country', 'cacNumber', 'fleetSize', 'fleetType',
            'businessLicense', 'insuranceCert', 'cacCertificate',
            'taxClearance',
            # Worker fields
            'vehicleType', 'vehiclePlateNumber', 'vehicleRegistration',
            'driversLicense', 'localGovernment',
            # Individual/Client fields
            'dob', 'profileImage'
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Filter out None values and fields not relevant to user type
        filtered_data = {}
        
        if instance.user_type == 'COMPANY':
            company_fields = [
                'id', 'email', 'companyName', 'registrationNumber', 'taxId',
                'website', 'country', 'cacNumber', 'phoneNumber', 'address',
                'city', 'state', 'postalCode', 'fleetSize', 'fleetType',
                'businessLicense', 'insuranceCert', 'cacCertificate',
                'taxClearance', 'kyc_status', 'is_active', 'date_joined', 'user_type',
            ]
            filtered_data = {k: v for k, v in data.items() if k in company_fields and v is not None}
            
        elif instance.user_type == 'WORKER':
            worker_fields = [
                'id', 'email', 'firstName', 'lastName', 'phoneNumber','user_type',
                'address', 'city', 'state', 'localGovernment', 'vehicleType',
                'vehiclePlateNumber', 'vehicleRegistration', 'driversLicense',
                'kyc_status', 'is_active', 'date_joined'
            ]
            filtered_data = {k: v for k, v in data.items() if k in worker_fields and v is not None}
            
        else:  # INDIVIDUAL or CLIENT
            basic_fields = [
                'id', 'email', 'firstName', 'lastName', 'phoneNumber',
                'address', 'city', 'state', 'localGovernment', 'dob',
                'profileImage', 'kyc_status', 'is_active', 'date_joined', 'user_type'
            ]
            filtered_data = {k: v for k, v in data.items() if k in basic_fields and v is not None}

        return filtered_data