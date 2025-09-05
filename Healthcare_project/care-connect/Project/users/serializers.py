from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.hashers import make_password
from .models import CustomUser

User = get_user_model()

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = (
            'id', 'email', 'username', 'first_name', 'last_name',
            'phone_number', 'date_of_birth', 'address',
            'medical_history', 'preferred_location',
            'insurance_provider', 'insurance_id',
            'preferred_hospital_type', 'max_distance',
            'preferred_specialties'
        )
        read_only_fields = ('email',)

class CustomUserDetailsSerializer(serializers.ModelSerializer):
    """
    User model w/o password
    """
    class Meta:
        model = CustomUser
        fields = (
            'id', 'email', 'username', 'first_name', 'last_name',
            'phone_number', 'date_of_birth', 'address',
            'medical_history', 'preferred_location',
            'insurance_provider', 'insurance_id',
            'preferred_hospital_type', 'max_distance',
            'preferred_specialties'
        )
        read_only_fields = ('email',)

class RegistrationSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(style={'input_type': 'password'}, write_only=True)
    
    class Meta:
        model = CustomUser
        fields = ('email', 'username', 'password', 'password2', 'first_name', 'last_name')
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords don't match")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password2')
        validated_data['password'] = make_password(validated_data.get('password'))
        user = CustomUser.objects.create_user(**validated_data)
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(style={'input_type': 'password'})
    
    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])
        if user and user.is_active:
            data['user'] = user
            return data
        raise serializers.ValidationError("Invalid email or password.")

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords don't match")
        validate_password(data['password'])
        return data

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords don't match")
        validate_password(data['password'])
        return data

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')
        read_only_fields = ('id',)

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data.get('password'))
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data.get('password'))
        return super().update(instance, validated_data) 