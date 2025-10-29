from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from sales.views import (
    CustomerViewSet, DailyRateViewSet, PurchaseViewSet,
    SaleViewSet, PaymentViewSet, ExpenseViewSet,
    backup_database, backup_status
)
from reports.views import (
    DailyReportView, PeriodReportView, ExpenseReportView, CustomerReportView
)
from .views import api_root

# Create router for viewsets
router = DefaultRouter()
router.register(r'customers', CustomerViewSet, basename='customer')
router.register(r'daily-rates', DailyRateViewSet, basename='dailyrate')
router.register(r'purchases', PurchaseViewSet, basename='purchase')
router.register(r'sales', SaleViewSet, basename='sale')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'expenses', ExpenseViewSet, basename='expense')

urlpatterns = [
    # Root API endpoint
    path('', api_root, name='api-root'),
    
    path('admin/', admin.site.urls),
    
    # API Authentication
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # API Routes
    path('api/', include(router.urls)),
    
    # Reports
    path('api/reports/daily/', DailyReportView.as_view(), name='daily-report'),
    path('api/reports/period/', PeriodReportView.as_view(), name='period-report'),
    path('api/reports/expenses/', ExpenseReportView.as_view(), name='expense-report'),
    path('api/customers/<int:customer_id>/report/', CustomerReportView.as_view(), name='customer-report'),
    
    # Backup
    path('api/backup/', backup_database, name='backup-database'),
    path('api/backup/status/', backup_status, name='backup-status'),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Customize admin site
admin.site.site_header = "Ahmad Poultry Services Admin"
admin.site.site_title = "Ahmad Poultry Services"
admin.site.index_title = "Welcome to Ahmad Poultry Services Management"
