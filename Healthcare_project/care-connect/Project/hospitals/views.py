from django.shortcuts import render
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from .models import Hospital, Doctor, Specialty, Review
from .serializers import (
    HospitalSerializer, DoctorSerializer,
    SpecialtySerializer, ReviewSerializer
)
from core.recommendation_engine import HealthcareRecommender

# Create your views here.

class SpecialtyViewSet(viewsets.ModelViewSet):
    queryset = Specialty.objects.all()
    serializer_class = SpecialtySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']

class HospitalViewSet(viewsets.ModelViewSet):
    queryset = Hospital.objects.all()
    serializer_class = HospitalSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['hospital_type', 'city', 'state', 'country', 'emergency_services']
    search_fields = ['name', 'description', 'facilities']
    ordering_fields = ['name', 'average_rating', 'total_reviews']
    
    @action(detail=False, methods=['post'])
    def recommend(self, request):
        """Get hospital recommendations based on user preferences."""
        try:
            latitude = float(request.data.get('latitude'))
            longitude = float(request.data.get('longitude'))
            max_distance = int(request.data.get('max_distance', 50))
            hospital_type = request.data.get('hospital_type')
            min_rating = float(request.data.get('min_rating', 0))
            
            recommender = HealthcareRecommender()
            recommendations = recommender.recommend_hospitals(
                user_location=(latitude, longitude),
                max_distance=max_distance,
                hospital_type=hospital_type,
                min_rating=min_rating
            )
            
            results = []
            for rec in recommendations:
                hospital_data = HospitalSerializer(rec['hospital']).data
                hospital_data.update({
                    'score': rec['score'],
                    'distance': rec['distance']
                })
                results.append(hospital_data)
            
            return Response(results)
        
        except (ValueError, TypeError) as e:
            return Response({'error': str(e)}, status=400)

class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['specialties', 'hospitals', 'years_of_experience']
    search_fields = ['first_name', 'last_name', 'bio']
    ordering_fields = ['first_name', 'last_name', 'average_rating', 'total_reviews', 'consultation_fee']
    
    @action(detail=False, methods=['post'])
    def recommend(self, request):
        """Get doctor recommendations based on user preferences."""
        try:
            specialties = request.data.get('specialties', [])
            hospital_id = request.data.get('hospital')
            min_rating = float(request.data.get('min_rating', 0))
            max_fee = request.data.get('max_fee')

            if max_fee is not None:
                max_fee = float(max_fee)

            # Fetch hospital object if hospital_id is provided
            hospital = None
            if hospital_id:
                try:
                    hospital = Hospital.objects.get(id=hospital_id)
                except Hospital.DoesNotExist:
                    return Response({'error': 'Hospital not found.'}, status=404)

            recommender = HealthcareRecommender()
            recommendations = recommender.recommend_doctors(
                specialties=specialties,
                hospital=hospital,
                min_rating=min_rating,
                max_fee=max_fee
            )
            
            results = []
            for rec in recommendations:
                doctor_data = DoctorSerializer(rec['doctor']).data
                doctor_data.update({
                    'score': rec['score'],
                    'fee': rec.get('fee'),
                })
                results.append(doctor_data)

            return Response(results)

        except (ValueError, TypeError) as e:
            return Response({'error': str(e)}, status=400)

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
