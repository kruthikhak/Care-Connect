from rest_framework import serializers
from .models import Hospital, Doctor, Specialty, Review

class SpecialtySerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialty
        fields = '__all__'

class HospitalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hospital
        fields = '__all__'

class DoctorSerializer(serializers.ModelSerializer):
    specialties = SpecialtySerializer(many=True, read_only=True)
    hospitals = HospitalSerializer(many=True, read_only=True)
    
    class Meta:
        model = Doctor
        fields = '__all__'

class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    
    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ('user',)
        
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data) 