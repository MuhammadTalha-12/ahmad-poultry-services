from django_filters import rest_framework as filters
from .models import Customer, DailyRate, Purchase, Sale, Payment, Expense


class CustomerFilter(filters.FilterSet):
    """Filter for Customer model"""
    name = filters.CharFilter(lookup_expr='icontains')
    is_active = filters.BooleanFilter()
    
    class Meta:
        model = Customer
        fields = ['name', 'is_active']


class DailyRateFilter(filters.FilterSet):
    """Filter for DailyRate model"""
    date = filters.DateFilter()
    date_from = filters.DateFilter(field_name='date', lookup_expr='gte')
    date_to = filters.DateFilter(field_name='date', lookup_expr='lte')
    
    class Meta:
        model = DailyRate
        fields = ['date']


class PurchaseFilter(filters.FilterSet):
    """Filter for Purchase model"""
    date = filters.DateFilter()
    date_from = filters.DateFilter(field_name='date', lookup_expr='gte')
    date_to = filters.DateFilter(field_name='date', lookup_expr='lte')
    supplier = filters.CharFilter(lookup_expr='icontains')
    
    class Meta:
        model = Purchase
        fields = ['date', 'supplier']


class SaleFilter(filters.FilterSet):
    """Filter for Sale model"""
    date = filters.DateFilter()
    date_from = filters.DateFilter(field_name='date', lookup_expr='gte')
    date_to = filters.DateFilter(field_name='date', lookup_expr='lte')
    customer = filters.NumberFilter()
    customer_name = filters.CharFilter(field_name='customer__name', lookup_expr='icontains')
    
    class Meta:
        model = Sale
        fields = ['date', 'customer']


class PaymentFilter(filters.FilterSet):
    """Filter for Payment model"""
    date = filters.DateFilter()
    date_from = filters.DateFilter(field_name='date', lookup_expr='gte')
    date_to = filters.DateFilter(field_name='date', lookup_expr='lte')
    customer = filters.NumberFilter()
    customer_name = filters.CharFilter(field_name='customer__name', lookup_expr='icontains')
    method = filters.ChoiceFilter(choices=Payment.PAYMENT_METHODS)
    
    class Meta:
        model = Payment
        fields = ['date', 'customer', 'method']


class ExpenseFilter(filters.FilterSet):
    """Filter for Expense model"""
    date = filters.DateFilter()
    date_from = filters.DateFilter(field_name='date', lookup_expr='gte')
    date_to = filters.DateFilter(field_name='date', lookup_expr='lte')
    category = filters.ChoiceFilter(choices=Expense.EXPENSE_CATEGORIES)
    
    class Meta:
        model = Expense
        fields = ['date', 'category']

