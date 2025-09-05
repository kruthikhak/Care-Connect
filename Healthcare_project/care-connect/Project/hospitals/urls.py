from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    HospitalViewSet, DoctorViewSet,
    SpecialtyViewSet, ReviewViewSet
)

router = DefaultRouter()
router.register(r'hospitals', HospitalViewSet)
router.register(r'doctors', DoctorViewSet)
router.register(r'specialties', SpecialtyViewSet)
router.register(r'reviews', ReviewViewSet, basename='review')

urlpatterns = [
    path('', include(router.urls)),
] 