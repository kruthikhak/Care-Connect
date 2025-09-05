from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class Specialty(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = "Specialties"

    def __str__(self):
        return self.name

class Hospital(models.Model):
    name = models.CharField(max_length=200)
    address = models.TextField()
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    website = models.URLField(blank=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class Doctor(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    license_number = models.CharField(max_length=50, unique=True)
    specialties = models.ManyToManyField(Specialty)
    hospitals = models.ManyToManyField(Hospital)
    years_of_experience = models.PositiveIntegerField()
    average_rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        default=0
    )
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    bio = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Dr. {self.first_name} {self.last_name}"

    class Meta:
        ordering = ['-average_rating', 'last_name', 'first_name'] 