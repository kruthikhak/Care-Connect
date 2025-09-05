from rest_framework import serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model

User = get_user_model()

# Serializer for User model
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'is_email_verified', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

# Serializer for user registration
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'confirm_password']
    
    def validate(self, data):
        # Check if passwords match
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords don't match")
        return data
    
    def create(self, validated_data):
        # Create the user object
        validated_data.pop('confirm_password')  # Remove confirm_password as it's not needed
        user = User.objects.create_user(**validated_data)
        return user

# View for user registration
class UserRegistrationView(APIView):
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
