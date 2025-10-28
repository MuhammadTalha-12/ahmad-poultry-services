from django.contrib import admin
from .models import Customer, DailyRate, Purchase, Sale, Payment, Expense


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


@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = ['date', 'supplier', 'kg', 'cost_rate_per_kg', 'total_cost', 'created_at']
    list_filter = ['date', 'supplier']
    search_fields = ['supplier', 'note']
    ordering = ['-date', '-created_at']
    readonly_fields = ['total_cost']


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
    list_display = ['date', 'customer', 'amount', 'method', 'created_at']
    list_filter = ['date', 'method', 'customer']
    search_fields = ['customer__name', 'note']
    ordering = ['-date', '-created_at']
    autocomplete_fields = ['customer']


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ['date', 'category', 'amount', 'created_at']
    list_filter = ['date', 'category']
    search_fields = ['note']
    ordering = ['-date', '-created_at']
