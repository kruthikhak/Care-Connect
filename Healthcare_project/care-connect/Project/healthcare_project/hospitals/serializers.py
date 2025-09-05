from rest_framework import serializers
from .models import Hospital, Doctor, Specialty

class SpecialtySerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialty
        fields = ['id', 'name', 'description']

class HospitalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hospital
        fields = ['id', 'name', 'address', 'phone', 'email', 'website', 'description']

class DoctorSerializer(serializers.ModelSerializer):
    specialties = SpecialtySerializer(many=True, read_only=True)
    hospitals = HospitalSerializer(many=True, read_only=True)
    
    class Meta:
        model = Doctor
        fields = [
            'id', 'first_name', 'last_name', 'license_number',
            'specialties', 'hospitals', 'years_of_experience',
            'average_rating', 'email', 'phone', 'bio',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def create(self, validated_data):
        specialties_data = self.context.get('specialties', [])
        hospitals_data = self.context.get('hospitals', [])
        
        doctor = Doctor.objects.create(**validated_data)
        
        doctor.specialties.set(specialties_data)
        doctor.hospitals.set(hospitals_data)
        
        return doctor

    def update(self, instance, validated_data):
        specialties_data = self.context.get('specialties', None)
        hospitals_data = self.context.get('hospitals', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if specialties_data is not None:
            instance.specialties.set(specialties_data)
        if hospitals_data is not None:
            instance.hospitals.set(hospitals_data)
        
        instance.save()
        return instance 