
from django.contrib import admin
from django.urls import path, include
from .views import UserRegistrationView
from django.conf.urls import url

urlpatterns = [
    path('api/register/', UserRegistrationView.as_view(), name='user-register'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/register/', include('dj_rest_auth.registration.urls')),
    path('api/accounts/', include('accounts.urls')),  # corrected the path to 'api/accounts/'
    path('api/hospitals/', include('hospitals.urls')),  # corrected the path to 'api/hospitals/'
]