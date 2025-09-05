
from rest_framework.views import exception_handler
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    
    # Third party apps
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'dj_rest_auth',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'dj_rest_auth.registration',
    
    # Your apps
    'accounts',
]

# Custom user model
AUTH_USER_MODEL = 'accounts.User'

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
]

# CORS settings
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
]

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# CSRF settings
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
]
CSRF_USE_SESSIONS = False
CSRF_COOKIE_HTTPONLY = False

# Session settings
SESSION_COOKIE_SECURE = False  # Set to True in production
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'EXCEPTION_HANDLER': 'path.to.custom_exception_handler',
}


# dj-rest-auth settings
REST_AUTH = {
    'USE_JWT': False,
    'TOKEN_MODEL': 'rest_framework.authtoken.models.Token',
    'USER_DETAILS_SERIALIZER': 'accounts.serializers.UserSerializer',
}

# django-allauth settings
SITE_ID = 1
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_EMAIL_VERIFICATION = 'none'
ACCOUNT_AUTHENTICATION_METHOD = 'username'
ACCOUNT_USERNAME_REQUIRED = True
ACCOUNT_UNIQUE_EMAIL = True
ACCOUNT_EMAIL_CONFIRMATION_EXPIRE_DAYS = 3
ACCOUNT_LOGIN_ATTEMPTS_LIMIT = 5
ACCOUNT_LOGIN_ATTEMPTS_TIMEOUT = 300
ACCOUNT_LOGOUT_ON_PASSWORD_CHANGE = True
ACCOUNT_SIGNUP_PASSWORD_ENTER_TWICE = True
ACCOUNT_USERNAME_MIN_LENGTH = 3
ACCOUNT_USERNAME_BLACKLIST = ['admin', 'administrator', 'moderator']
ACCOUNT_PASSWORD_MIN_LENGTH = 8
ACCOUNT_PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher',
]

# Email settings for development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend' 



def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)    
    return response 

