from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

class CustomUser(AbstractUser):
    email = models.EmailField(_('email address'), unique=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    date_of_birth = models.DateField(null=True, blank=True)
    address = models.TextField(blank=True, null=True)
    medical_history = models.TextField(blank=True, null=True)
    
    # Healthcare preferences
    preferred_location = models.CharField(max_length=100, blank=True, null=True)
    insurance_provider = models.CharField(max_length=100, blank=True, null=True)
    insurance_id = models.CharField(max_length=50, blank=True, null=True)
    preferred_hospital_type = models.CharField(max_length=50, blank=True, null=True)
    max_distance = models.IntegerField(null=True, blank=True)
    preferred_specialties = models.JSONField(default=list, blank=True)
    
    # Profile fields
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    gender = models.CharField(max_length=10, choices=[('M', 'Male'), ('F', 'Female'), ('O', 'Other')], blank=True, null=True)
    emergency_contact_name = models.CharField(max_length=100, blank=True, null=True)
    emergency_contact_phone = models.CharField(max_length=15, blank=True, null=True)
    blood_type = models.CharField(max_length=5, blank=True, null=True)
    allergies = models.TextField(blank=True, null=True)
    preferred_language = models.CharField(max_length=50, blank=True, null=True)
    
    # Verification fields
    verification_token = models.CharField(max_length=64, blank=True, null=True)
    verification_token_created = models.DateTimeField(null=True, blank=True)
    password_reset_token = models.CharField(max_length=64, blank=True, null=True)
    password_reset_token_created = models.DateTimeField(null=True, blank=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def __str__(self):
        return self.email
