from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.renderers import JSONRenderer, BrowsableAPIRenderer
from django_filters.rest_framework import DjangoFilterBackend
from .models import Hospital, Doctor, Specialty
from .serializers import HospitalSerializer, DoctorSerializer, SpecialtySerializer

class SpecialtyViewSet(viewsets.ModelViewSet):
    queryset = Specialty.objects.all()
    serializer_class = SpecialtySerializer
    permission_classes = [IsAuthenticated]
    renderer_classes = [JSONRenderer, BrowsableAPIRenderer]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name']

class HospitalViewSet(viewsets.ModelViewSet):
    queryset = Hospital.objects.all()
    serializer_class = HospitalSerializer
    permission_classes = [IsAuthenticated]
    renderer_classes = [JSONRenderer, BrowsableAPIRenderer]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['name']
    search_fields = ['name', 'address', 'description']
    ordering_fields = ['name']

class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [IsAuthenticated]
    renderer_classes = [JSONRenderer, BrowsableAPIRenderer]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['specialties', 'hospitals', 'is_active']
    search_fields = ['first_name', 'last_name', 'license_number', 'bio']
    ordering_fields = ['last_name', 'first_name', 'average_rating', 'years_of_experience']

    def get_queryset(self):
        queryset = super().get_queryset()
        specialty = self.request.query_params.get('specialty', None)
        if specialty:
            queryset = queryset.filter(specialties__name=specialty)
        return queryset 