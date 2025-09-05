from django_ratelimit.decorators import ratelimit
from functools import wraps
from rest_framework.exceptions import Throttled

def api_rate_limit(key='ip', rate='100/h', block=True):
    """
    Custom rate limit decorator for API views.
    
    Args:
        key (str): The key to rate limit on ('ip' or 'user')
        rate (str): The rate limit (e.g., '100/h' for 100 requests per hour)
        block (bool): Whether to block requests when rate limit is exceeded
    
    Returns:
        function: Decorated view function
    """
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            try:
                return ratelimit(key=key, rate=rate, block=block)(view_func)(request, *args, **kwargs)
            except Throttled:
                raise Throttled(detail={
                    'message': 'Request was throttled. Please try again later.',
                    'retry_after': request.ratelimit['retry_after']
                })
        return _wrapped_view
    return decorator 