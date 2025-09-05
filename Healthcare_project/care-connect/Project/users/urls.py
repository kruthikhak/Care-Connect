from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomUserViewSet

router = DefaultRouter()
router.register(r'users', CustomUserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', CustomUserViewSet.as_view({'post': 'register'}), name='register'),
    path('auth/login/', CustomUserViewSet.as_view({'post': 'login'}), name='login'),
    path('auth/logout/', CustomUserViewSet.as_view({'post': 'logout'}), name='logout'),
    path('check-username/<str:username>/', CustomUserViewSet.as_view({'get': 'check_username'}), name='check-username'),
] 