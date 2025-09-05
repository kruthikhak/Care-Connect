from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse

@api_view(['GET'])
def health_check(request):
    return Response({"status": "healthy"})

@api_view(['GET'])
def api_root(request):
    return Response({
        'doctors': '/api/doctors/',
        'hospitals': '/api/hospitals/',
        'specialties': '/api/specialties/',
        'auth': '/api/auth/',
        'docs': '/api/docs/',
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/', api_root, name='api-root'),
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    path('api/accounts/', include('accounts.urls')),
    path('api/health/', health_check, name='health-check'),
    path('api/', include('hospitals.urls')),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

# Add debug toolbar URLs in debug mode
if settings.DEBUG:
    urlpatterns += [
        path('__debug__/', include('debug_toolbar.urls')),
    ]
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Add catch-all route for frontend
urlpatterns += [
    re_path(r'^.*', TemplateView.as_view(template_name='index.html'), name='frontend'),
] 