from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HospitalViewSet, DoctorViewSet, SpecialtyViewSet

router = DefaultRouter()
router.register(r'specialties', SpecialtyViewSet)
router.register(r'hospitals', HospitalViewSet)
router.register(r'doctors', DoctorViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 