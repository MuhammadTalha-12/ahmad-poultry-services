from rest_framework import serializers
from .models import Customer, DailyRate, Purchase, Sale, Payment, Expense
from decimal import Decimal


class CustomerSerializer(serializers.ModelSerializer):
    running_balance = serializers.DecimalField(
        max_digits=12, 
        decimal_places=3, 
        read_only=True
    )
    
    class Meta:
        model = Customer
        fields = [
            'id', 'name', 'phone', 'address', 'opening_balance',
            'is_active', 'running_balance', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class DailyRateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyRate
        fields = [
            'id', 'date', 'default_cost_rate', 'default_sale_rate',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class PurchaseSerializer(serializers.ModelSerializer):
    total_cost = serializers.DecimalField(
        max_digits=12,
        decimal_places=3,
        read_only=True
    )
    
    class Meta:
        model = Purchase
        fields = [
            'id', 'date', 'supplier', 'kg', 'cost_rate_per_kg',
            'total_cost', 'note', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class SaleSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    total_amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=3,
        read_only=True
    )
    borrow_amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=3,
        read_only=True
    )
    profit = serializers.DecimalField(
        max_digits=12,
        decimal_places=3,
        read_only=True
    )
    
    class Meta:
        model = Sale
        fields = [
            'id', 'date', 'customer', 'customer_name', 'kg',
            'sale_rate_per_kg', 'cost_rate_snapshot', 'total_amount',
            'amount_received', 'borrow_amount', 'profit', 'note',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, data):
        """Validate that amount_received doesn't exceed total_amount"""
        kg = data.get('kg')
        sale_rate = data.get('sale_rate_per_kg')
        amount_received = data.get('amount_received', Decimal('0.000'))
        
        if kg and sale_rate:
            total_amount = kg * sale_rate
            if amount_received > total_amount:
                raise serializers.ValidationError(
                    "Amount received cannot exceed total sale amount"
                )
        
        return data


class PaymentSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'date', 'customer', 'customer_name', 'amount',
            'method', 'note', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class ExpenseSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = Expense
        fields = [
            'id', 'date', 'category', 'category_display', 'amount',
            'note', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

