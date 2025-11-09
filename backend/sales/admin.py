from django.contrib import admin
from .models import Customer, DailyRate, Purchase, Sale, Payment, Expense, CustomerDeduction, Supplier, SupplierPayment


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone', 'opening_balance', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'phone', 'address']
    ordering = ['name']


@admin.register(DailyRate)
class DailyRateAdmin(admin.ModelAdmin):
    list_display = ['date', 'default_cost_rate', 'default_sale_rate', 'created_at']
    list_filter = ['date']
    ordering = ['-date']


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone', 'opening_balance', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'phone']
    ordering = ['name']


@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = ['date', 'supplier', 'vehicle_number', 'kg', 'cost_rate_per_kg', 'amount_paid', 'total_cost', 'borrow_amount', 'created_at']
    list_filter = ['date', 'supplier']
    search_fields = ['supplier__name', 'vehicle_number', 'note']
    ordering = ['-date', '-created_at']
    readonly_fields = ['total_cost', 'borrow_amount']
    autocomplete_fields = ['supplier']


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = [
        'date', 'customer', 'kg', 'sale_rate_per_kg', 
        'total_amount', 'amount_received', 'borrow_amount', 'profit'
    ]
    list_filter = ['date', 'customer']
    search_fields = ['customer__name', 'note']
    ordering = ['-date', '-created_at']
    readonly_fields = ['total_amount', 'borrow_amount', 'profit']
    autocomplete_fields = ['customer']


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['date', 'customer', 'amount', 'method', 'auto_allocated', 'created_at']
    list_filter = ['date', 'method', 'customer', 'auto_allocated']
    search_fields = ['customer__name', 'note']
    ordering = ['-date', '-created_at']
    autocomplete_fields = ['customer']
    readonly_fields = ['auto_allocated']


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ['date', 'category', 'amount', 'created_at']
    list_filter = ['date', 'category']
    search_fields = ['note']
    ordering = ['-date', '-created_at']


@admin.register(CustomerDeduction)
class CustomerDeductionAdmin(admin.ModelAdmin):
    list_display = ['date', 'customer', 'amount', 'deduction_type', 'created_at']
    list_filter = ['date', 'deduction_type', 'customer']
    search_fields = ['customer__name', 'note']
    ordering = ['-date', '-created_at']
    autocomplete_fields = ['customer']


@admin.register(SupplierPayment)
class SupplierPaymentAdmin(admin.ModelAdmin):
    list_display = ['date', 'supplier', 'amount', 'method', 'created_at']
    list_filter = ['date', 'method', 'supplier']
    search_fields = ['supplier__name', 'note']
    ordering = ['-date', '-created_at']
    autocomplete_fields = ['supplier']
