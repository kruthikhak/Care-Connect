from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from users.models import CustomUser

class Specialty(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    
    class Meta:
        verbose_name_plural = 'specialties'
        
    def __str__(self):
        return self.name

class Hospital(models.Model):
    HOSPITAL_TYPES = [
        ('public', 'Public Hospital'),
        ('private', 'Private Hospital'),
        ('clinic', 'Clinic'),
        ('specialized', 'Specialized Center'),
    ]
    
    name = models.CharField(max_length=200)
    hospital_type = models.CharField(max_length=20, choices=HOSPITAL_TYPES)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=10)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    website = models.URLField(blank=True)
    description = models.TextField(blank=True)
    facilities = models.JSONField(default=list)
    emergency_services = models.BooleanField(default=False)
    specialties = models.ManyToManyField(Specialty, related_name='hospitals')
    rating = models.DecimalField(
        max_digits=2,
        decimal_places=1,
        default=0.0,
        validators=[MinValueValidator(1.0), MaxValueValidator(5.0)]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Metrics for recommendation engine
    average_rating = models.DecimalField(
        max_digits=3, 
        decimal_places=2,
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(5.0)]
    )
    total_reviews = models.PositiveIntegerField(default=0)
    success_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)]
    )
    
    def __str__(self):
        return self.name

class Doctor(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, null=True, blank=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    specialties = models.ManyToManyField(Specialty)
    hospitals = models.ManyToManyField(Hospital, related_name='doctors')
    license_number = models.CharField(max_length=50, unique=True)
    years_of_experience = models.PositiveIntegerField()
    education = models.JSONField(default=list)
    certifications = models.JSONField(default=list)
    bio = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to='doctors/', blank=True)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2)
    available_time_slots = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Metrics for recommendation engine
    average_rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(5.0)]
    )
    total_reviews = models.PositiveIntegerField(default=0)
    success_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)]
    )
    
    def __str__(self):
        return f"Dr. {self.first_name} {self.last_name}"
    
    def full_name(self):
        return f"Dr. {self.first_name} {self.last_name}"

class Review(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, null=True, blank=True)
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, null=True, blank=True)
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(hospital__isnull=False) | models.Q(doctor__isnull=False),
                name='review_for_hospital_or_doctor'
            )
        ]
    
    def __str__(self):
        if self.hospital:
            return f"Review for {self.hospital.name}"
        return f"Review for {self.doctor.full_name()}"
