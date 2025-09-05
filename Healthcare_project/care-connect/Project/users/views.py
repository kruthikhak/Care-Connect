from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import login, logout, authenticate, get_user_model
from rest_framework.authtoken.models import Token
from django.core.mail import send_mail
from django.conf import settings
from django.utils.crypto import get_random_string
from django.utils import timezone
from datetime import timedelta
from .models import CustomUser
from .serializers import (
    CustomUserSerializer,
    CustomUserDetailsSerializer,
    RegistrationSerializer,
    LoginSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    ChangePasswordSerializer,
    UserSerializer
)
from django.contrib.auth.hashers import make_password
import logging
import json

logger = logging.getLogger(__name__)

User = get_user_model()

# Create your views here.

class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['post'])
    def register(self, request):
        try:
            # Get the data from request
            if isinstance(request.data, str):
                data = json.loads(request.data)
            else:
                data = request.data

            # Validate required fields
            required_fields = ['username', 'email', 'password', 'password2']
            for field in required_fields:
                if not data.get(field):
                    return Response({
                        'error': f'{field} is required'
                    }, status=status.HTTP_400_BAD_REQUEST)

            # Get passwords from request
            password = data.get('password')
            password2 = data.get('password2')

            # Validate passwords match
            if password != password2:
                return Response({
                    'error': 'Passwords do not match'
                }, status=status.HTTP_400_BAD_REQUEST)

            try:
                # Check if username already exists
                if CustomUser.objects.filter(username=data.get('username')).exists():
                    return Response({
                        'error': 'Username already exists'
                    }, status=status.HTTP_400_BAD_REQUEST)

                # Check if email already exists
                if CustomUser.objects.filter(email=data.get('email')).exists():
                    return Response({
                        'error': 'Email already exists'
                    }, status=status.HTTP_400_BAD_REQUEST)

                # Create user
                user = CustomUser.objects.create_user(
                    username=data.get('username'),
                    email=data.get('email'),
                    password=password
                )

                # Generate auth token
                token, _ = Token.objects.get_or_create(user=user)

                response_data = {
                    'token': token.key,
                    'user': UserSerializer(user).data,
                    'message': 'Registration successful'
                }
                logger.info(f"Registration successful for user: {user.username}")
                return Response(response_data, status=status.HTTP_201_CREATED)

            except Exception as e:
                logger.error(f"Registration error: {str(e)}")
                return Response({
                    'error': str(e)
                }, status=status.HTTP_400_BAD_REQUEST)

        except json.JSONDecodeError:
            return Response({
                'error': 'Invalid JSON data'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Registration error: {str(e)}")
            return Response({
                'error': 'An error occurred during registration'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def login(self, request):
        try:
            # Get the data from request
            if isinstance(request.data, str):
                data = json.loads(request.data)
            else:
                data = request.data

            email_or_username = data.get('email') or data.get('username')
            password = data.get('password')

            if not email_or_username or not password:
                return Response({
                    'error': 'Please provide both email/username and password'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Try to find user by email first
            try:
                user = CustomUser.objects.get(email=email_or_username)
            except CustomUser.DoesNotExist:
                # If not found by email, try username
                try:
                    user = CustomUser.objects.get(username=email_or_username)
                except CustomUser.DoesNotExist:
                    return Response({
                        'error': 'No user found with this email or username'
                    }, status=status.HTTP_404_NOT_FOUND)

            # Authenticate user
            authenticated_user = authenticate(username=user.username, password=password)

            if authenticated_user:
                login(request, authenticated_user)
                token, _ = Token.objects.get_or_create(user=authenticated_user)
                return Response({
                    'key': token.key,
                    'user': UserSerializer(authenticated_user).data
                })
            else:
                return Response({
                    'error': 'Invalid credentials'
                }, status=status.HTTP_401_UNAUTHORIZED)

        except json.JSONDecodeError:
            return Response({
                'error': 'Invalid JSON data'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            return Response({
                'error': 'An error occurred during login'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def logout(self, request):
        if request.user.is_authenticated:
            Token.objects.filter(user=request.user).delete()
            logout(request)
            return Response({'message': 'Logged out successfully'})
        return Response(status=status.HTTP_401_UNAUTHORIZED)

    def get_permissions(self):
        if self.action in ['register', 'login']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        # Users can only see their own profile
        return CustomUser.objects.filter(id=self.request.user.id)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put', 'patch'])
    def update_preferences(self, request):
        user = request.user
        serializer = self.get_serializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def check_username(self, request, username):
        exists = User.objects.filter(username=username).exists()
        return Response({'exists': exists})

@api_view(['GET'])
@permission_classes([AllowAny])
def check_username(request, username):
    exists = User.objects.filter(username=username).exists()
    return Response({'exists': exists})
