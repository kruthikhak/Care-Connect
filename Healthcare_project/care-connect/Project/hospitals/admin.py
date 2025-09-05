from django.contrib import admin
from .models import Hospital, Doctor, Specialty, Review

@admin.register(Hospital)
class HospitalAdmin(admin.ModelAdmin):
    list_display = ('name', 'hospital_type', 'city', 'average_rating', 'total_reviews')
    list_filter = ('hospital_type', 'city', 'state', 'emergency_services')
    search_fields = ('name', 'description')

@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'license_number', 'years_of_experience', 'average_rating')
    list_filter = ('specialties', 'hospitals', 'years_of_experience')
    search_fields = ('first_name', 'last_name', 'license_number')
    filter_horizontal = ('specialties', 'hospitals')

@admin.register(Specialty)
class SpecialtyAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name', 'description')

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('user', 'hospital', 'doctor', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('comment',)
