from rest_framework import viewsets, filters, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from django.http import FileResponse, HttpResponse
from django.utils import timezone
from django.core.management import call_command
from .models import Customer, DailyRate, Purchase, Sale, Payment, Expense, CustomerDeduction
from .serializers import (
    CustomerSerializer, DailyRateSerializer, PurchaseSerializer,
    SaleSerializer, PaymentSerializer, ExpenseSerializer, CustomerDeductionSerializer
)
from .filters import (
    CustomerFilter, PurchaseFilter, SaleFilter,
    PaymentFilter, ExpenseFilter, DailyRateFilter, CustomerDeductionFilter
)
import os


class CustomerViewSet(viewsets.ModelViewSet):
    """ViewSet for Customer model"""
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = CustomerFilter
    search_fields = ['name', 'phone', 'address']
    ordering_fields = ['name', 'created_at', 'opening_balance']
    ordering = ['name']

    @action(detail=True, methods=['get'])
    def statement(self, request, pk=None):
        """Get customer statement with all transactions"""
        customer = self.get_object()
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        # Get sales
        sales = customer.sales.all()
        if start_date:
            sales = sales.filter(date__gte=start_date)
        if end_date:
            sales = sales.filter(date__lte=end_date)
        
        # Get payments
        payments = customer.payments.all()
        if start_date:
            payments = payments.filter(date__gte=start_date)
        if end_date:
            payments = payments.filter(date__lte=end_date)
        
        return Response({
            'customer': CustomerSerializer(customer).data,
            'sales': SaleSerializer(sales, many=True).data,
            'payments': PaymentSerializer(payments, many=True).data,
            'opening_balance': customer.opening_balance,
            'closing_balance': customer.running_balance,
        })


class DailyRateViewSet(viewsets.ModelViewSet):
    """ViewSet for DailyRate model"""
    queryset = DailyRate.objects.all()
    serializer_class = DailyRateSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = DailyRateFilter
    ordering_fields = ['date']
    ordering = ['-date']


class PurchaseViewSet(viewsets.ModelViewSet):
    """ViewSet for Purchase model"""
    queryset = Purchase.objects.all()
    serializer_class = PurchaseSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = PurchaseFilter
    search_fields = ['supplier', 'note']
    ordering_fields = ['date', 'kg', 'cost_rate_per_kg', 'created_at']
    ordering = ['-date', '-created_at']


class SaleViewSet(viewsets.ModelViewSet):
    """ViewSet for Sale model"""
    queryset = Sale.objects.select_related('customer').all()
    serializer_class = SaleSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = SaleFilter
    search_fields = ['customer__name', 'note']
    ordering_fields = ['date', 'kg', 'sale_rate_per_kg', 'created_at']
    ordering = ['-date', '-created_at']


class PaymentViewSet(viewsets.ModelViewSet):
    """ViewSet for Payment model"""
    queryset = Payment.objects.select_related('customer').all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = PaymentFilter
    search_fields = ['customer__name', 'note']
    ordering_fields = ['date', 'amount', 'created_at']
    ordering = ['-date', '-created_at']
    
    def perform_create(self, serializer):
        """Create payment and auto-allocate to customer's outstanding sales"""
        payment = serializer.save()
        # Auto-allocate this payment to customer's sales with outstanding borrow amounts
        payment.allocate_to_sales()
    
    def perform_update(self, serializer):
        """Update payment and re-allocate if needed"""
        payment = serializer.save()
        # If payment details changed and not yet allocated, allocate it
        if not payment.auto_allocated:
            payment.allocate_to_sales()


class ExpenseViewSet(viewsets.ModelViewSet):
    """ViewSet for Expense model"""
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ExpenseFilter
    search_fields = ['note']
    ordering_fields = ['date', 'amount', 'category', 'created_at']
    ordering = ['-date', '-created_at']


class CustomerDeductionViewSet(viewsets.ModelViewSet):
    """ViewSet for CustomerDeduction model"""
    queryset = CustomerDeduction.objects.select_related('customer').all()
    serializer_class = CustomerDeductionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = CustomerDeductionFilter
    search_fields = ['customer__name', 'note']
    ordering_fields = ['date', 'amount', 'created_at']
    ordering = ['-date', '-created_at']


@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def backup_database(request):
    """
    Create and download database backup
    Only accessible to admin users
    Returns Excel file with all data
    """
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        output_dir = 'backups'
        
        # Create backups directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)
        
        logger.info("Starting backup process...")
        
        # Call the management command to create backup
        call_command('backup_data', output_dir=output_dir)
        
        logger.info("Backup command completed, looking for latest file...")
        
        # Get the most recently created Excel file
        excel_files = [f for f in os.listdir(output_dir) if f.endswith('.xlsx') and f.startswith('ahmad_poultry_backup_')]
        
        if not excel_files:
            logger.error("No backup files found after command execution")
            return Response(
                {'error': 'Backup file not created. Please check server logs.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Sort by modification time to get the latest
        excel_files.sort(key=lambda x: os.path.getmtime(os.path.join(output_dir, x)), reverse=True)
        latest_file = excel_files[0]
        excel_file_path = os.path.join(output_dir, latest_file)
        
        logger.info(f"Found backup file: {latest_file}")
        
        # Return the Excel file as download
        if os.path.exists(excel_file_path):
            file_handle = open(excel_file_path, 'rb')
            response = FileResponse(
                file_handle,
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = f'attachment; filename="{latest_file}"'
            return response
        else:
            logger.error(f"Backup file exists check failed: {excel_file_path}")
            return Response(
                {'error': 'Backup file not found after creation'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    except Exception as e:
        logger.error(f"Backup failed with exception: {str(e)}", exc_info=True)
        return Response(
            {'error': f'Backup failed: {str(e)}. Please contact administrator.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def backup_status(request):
    """
    Get backup statistics and last backup info
    Only accessible to admin users
    """
    try:
        output_dir = 'backups'
        
        # Get list of backup files
        backup_files = []
        if os.path.exists(output_dir):
            files = [f for f in os.listdir(output_dir) if f.endswith('.xlsx')]
            files.sort(reverse=True)
            
            for file in files[:10]:  # Return last 10 backups
                file_path = os.path.join(output_dir, file)
                file_stat = os.stat(file_path)
                backup_files.append({
                    'filename': file,
                    'size': file_stat.st_size,
                    'created_at': timezone.datetime.fromtimestamp(file_stat.st_mtime).isoformat()
                })
        
        # Get current database statistics
        stats = {
            'customers': Customer.objects.count(),
            'daily_rates': DailyRate.objects.count(),
            'purchases': Purchase.objects.count(),
            'sales': Sale.objects.count(),
            'payments': Payment.objects.count(),
            'expenses': Expense.objects.count(),
            'total_records': (
                Customer.objects.count() +
                DailyRate.objects.count() +
                Purchase.objects.count() +
                Sale.objects.count() +
                Payment.objects.count() +
                Expense.objects.count()
            )
        }
        
        return Response({
            'statistics': stats,
            'recent_backups': backup_files,
            'backup_directory': output_dir
        })
    
    except Exception as e:
        return Response(
            {'error': f'Failed to get backup status: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
