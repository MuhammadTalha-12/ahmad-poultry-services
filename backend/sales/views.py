from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Customer, DailyRate, Purchase, Sale, Payment, Expense
from .serializers import (
    CustomerSerializer, DailyRateSerializer, PurchaseSerializer,
    SaleSerializer, PaymentSerializer, ExpenseSerializer
)
from .filters import (
    CustomerFilter, PurchaseFilter, SaleFilter,
    PaymentFilter, ExpenseFilter, DailyRateFilter
)


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
