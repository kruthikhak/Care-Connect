from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.http import Http404

def custom_exception_handler(exc, context):
    """
    Custom exception handler for better error responses.
    """
    response = exception_handler(exc, context)

    if response is not None:
        response.data['status_code'] = response.status_code
        return response

    if isinstance(exc, ValidationError):
        data = {
            'message': 'Validation error',
            'errors': exc.message_dict if hasattr(exc, 'message_dict') else exc.messages,
            'status_code': status.HTTP_400_BAD_REQUEST
        }
        return Response(data, status=status.HTTP_400_BAD_REQUEST)

    if isinstance(exc, IntegrityError):
        data = {
            'message': 'Database integrity error',
            'error': str(exc),
            'status_code': status.HTTP_400_BAD_REQUEST
        }
        return Response(data, status=status.HTTP_400_BAD_REQUEST)

    if isinstance(exc, Http404):
        data = {
            'message': 'Resource not found',
            'error': str(exc),
            'status_code': status.HTTP_404_NOT_FOUND
        }
        return Response(data, status=status.HTTP_404_NOT_FOUND)

    data = {
        'message': 'Internal server error',
        'error': str(exc),
        'status_code': status.HTTP_500_INTERNAL_SERVER_ERROR
    }
    return Response(data, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 