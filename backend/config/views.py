from django.http import JsonResponse
from django.views.decorators.http import require_http_methods


@require_http_methods(["GET"])
def api_root(request):
    """API root endpoint with welcome message and links"""
    return JsonResponse({
        'message': 'Welcome to Ahmad Poultry Services API',
        'version': '1.0.0',
        'documentation': '/api/docs/',
        'schema': '/api/schema/',
        'admin': '/admin/',
        'endpoints': {
            'auth': {
                'login': '/api/auth/login/',
                'refresh': '/api/auth/refresh/',
            },
            'resources': {
                'customers': '/api/customers/',
                'sales': '/api/sales/',
                'purchases': '/api/purchases/',
                'payments': '/api/payments/',
                'expenses': '/api/expenses/',
                'daily_rates': '/api/daily-rates/',
            },
            'reports': {
                'daily': '/api/reports/daily/?date=YYYY-MM-DD',
                'period': '/api/reports/period/?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD',
                'expenses': '/api/reports/expenses/',
                'customer': '/api/customers/{id}/report/',
            }
        }
    })

