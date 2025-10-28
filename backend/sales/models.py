from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal


class Customer(models.Model):
    """Customer model to store customer information"""
    name = models.CharField(max_length=255, unique=True, db_index=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    opening_balance = models.DecimalField(
        max_digits=12, 
        decimal_places=3, 
        default=Decimal('0.000'),
        validators=[MinValueValidator(Decimal('0.000'))]
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return self.name

    @property
    def running_balance(self):
        """Calculate customer's running balance"""
        total_sales = self.sales.aggregate(
            total=models.Sum('total_amount')
        )['total'] or Decimal('0.000')
        
        total_payments = self.payments.aggregate(
            total=models.Sum('amount')
        )['total'] or Decimal('0.000')
        
        return self.opening_balance + total_sales - total_payments


class DailyRate(models.Model):
    """Store default cost and sale rates for each day"""
    date = models.DateField(unique=True, db_index=True)
    default_cost_rate = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        validators=[MinValueValidator(Decimal('0.000'))]
    )
    default_sale_rate = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        validators=[MinValueValidator(Decimal('0.000'))]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']
        indexes = [
            models.Index(fields=['date']),
        ]

    def __str__(self):
        return f"{self.date} - Cost: {self.default_cost_rate}, Sale: {self.default_sale_rate}"


class Purchase(models.Model):
    """Track daily purchases from poultry farms"""
    date = models.DateField(db_index=True)
    supplier = models.CharField(max_length=255, blank=True)
    kg = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        validators=[MinValueValidator(Decimal('0.001'))]
    )
    cost_rate_per_kg = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        validators=[MinValueValidator(Decimal('0.000'))]
    )
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['date']),
            models.Index(fields=['-date', '-created_at']),
        ]

    def __str__(self):
        return f"{self.date} - {self.kg}kg @ {self.cost_rate_per_kg}/kg"

    @property
    def total_cost(self):
        """Calculate total cost of purchase"""
        return self.kg * self.cost_rate_per_kg


class Sale(models.Model):
    """Track sales to customers"""
    date = models.DateField(db_index=True)
    customer = models.ForeignKey(
        Customer,
        on_delete=models.PROTECT,
        related_name='sales'
    )
    kg = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        validators=[MinValueValidator(Decimal('0.001'))]
    )
    sale_rate_per_kg = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        validators=[MinValueValidator(Decimal('0.000'))]
    )
    cost_rate_snapshot = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        validators=[MinValueValidator(Decimal('0.000'))],
        help_text="Cost rate per kg at time of sale for profit calculation"
    )
    amount_received = models.DecimalField(
        max_digits=12,
        decimal_places=3,
        default=Decimal('0.000'),
        validators=[MinValueValidator(Decimal('0.000'))]
    )
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['date']),
            models.Index(fields=['customer', 'date']),
            models.Index(fields=['-date', '-created_at']),
        ]

    def __str__(self):
        return f"{self.date} - {self.customer.name} - {self.kg}kg"

    @property
    def total_amount(self):
        """Calculate total sale amount"""
        return self.kg * self.sale_rate_per_kg

    @property
    def borrow_amount(self):
        """Calculate outstanding amount"""
        return self.total_amount - self.amount_received

    @property
    def profit(self):
        """Calculate profit on this sale"""
        return self.kg * (self.sale_rate_per_kg - self.cost_rate_snapshot)


class Payment(models.Model):
    """Track customer payments"""
    PAYMENT_METHODS = [
        ('cash', 'Cash'),
        ('bank', 'Bank Transfer'),
        ('other', 'Other'),
    ]

    date = models.DateField(db_index=True)
    customer = models.ForeignKey(
        Customer,
        on_delete=models.PROTECT,
        related_name='payments'
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=3,
        validators=[MinValueValidator(Decimal('0.001'))]
    )
    method = models.CharField(max_length=20, choices=PAYMENT_METHODS, default='cash')
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['date']),
            models.Index(fields=['customer', 'date']),
            models.Index(fields=['-date', '-created_at']),
        ]

    def __str__(self):
        return f"{self.date} - {self.customer.name} - {self.amount}"


class Expense(models.Model):
    """Track business expenses"""
    EXPENSE_CATEGORIES = [
        ('van_repair', 'Van Repair'),
        ('feed', 'Feed'),
        ('salary', 'Salary'),
        ('petrol', 'Petrol'),
        ('other', 'Other'),
    ]

    date = models.DateField(db_index=True)
    category = models.CharField(max_length=20, choices=EXPENSE_CATEGORIES)
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=3,
        validators=[MinValueValidator(Decimal('0.001'))]
    )
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['date']),
            models.Index(fields=['category', 'date']),
            models.Index(fields=['-date', '-created_at']),
        ]

    def __str__(self):
        return f"{self.date} - {self.get_category_display()} - {self.amount}"
