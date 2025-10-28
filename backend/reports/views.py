from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Q
from decimal import Decimal
from datetime import datetime, date
from sales.models import Purchase, Sale, Payment, Expense, Customer


class DailyReportView(APIView):
    """Generate daily business report"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        report_date = request.query_params.get('date')
        if not report_date:
            report_date = date.today()
        else:
            report_date = datetime.strptime(report_date, '%Y-%m-%d').date()
        
        # Purchases
        purchases = Purchase.objects.filter(date=report_date)
        purchases_kg = purchases.aggregate(total=Sum('kg'))['total'] or Decimal('0.000')
        purchases_cost = sum([p.total_cost for p in purchases]) or Decimal('0.000')
        
        # Sales
        sales = Sale.objects.filter(date=report_date)
        sales_kg = sales.aggregate(total=Sum('kg'))['total'] or Decimal('0.000')
        sales_revenue = sum([s.total_amount for s in sales]) or Decimal('0.000')
        cash_received = sales.aggregate(total=Sum('amount_received'))['total'] or Decimal('0.000')
        borrow = sales_revenue - cash_received
        profit = sum([s.profit for s in sales]) or Decimal('0.000')
        
        # Expenses
        expenses = Expense.objects.filter(date=report_date)
        expenses_total = expenses.aggregate(total=Sum('amount'))['total'] or Decimal('0.000')
        
        # Inventory
        total_purchases = Purchase.objects.aggregate(total=Sum('kg'))['total'] or Decimal('0.000')
        total_sales = Sale.objects.aggregate(total=Sum('kg'))['total'] or Decimal('0.000')
        closing_stock = total_purchases - total_sales
        
        return Response({
            'date': report_date,
            'purchases_kg': purchases_kg,
            'purchases_cost': purchases_cost,
            'sales_kg': sales_kg,
            'sales_revenue': sales_revenue,
            'profit': profit,
            'cash_received': cash_received,
            'borrow': borrow,
            'expenses_total': expenses_total,
            'closing_stock': closing_stock,
        })


class PeriodReportView(APIView):
    """Generate report for a date range"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if not start_date or not end_date:
            return Response({'error': 'start_date and end_date are required'}, status=400)
        
        start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        
        # Purchases
        purchases = Purchase.objects.filter(date__gte=start_date, date__lte=end_date)
        purchases_kg = purchases.aggregate(total=Sum('kg'))['total'] or Decimal('0.000')
        purchases_cost = sum([p.total_cost for p in purchases]) or Decimal('0.000')
        
        # Sales
        sales = Sale.objects.filter(date__gte=start_date, date__lte=end_date)
        sales_kg = sales.aggregate(total=Sum('kg'))['total'] or Decimal('0.000')
        sales_revenue = sum([s.total_amount for s in sales]) or Decimal('0.000')
        cash_received = sales.aggregate(total=Sum('amount_received'))['total'] or Decimal('0.000')
        borrow = sales_revenue - cash_received
        profit = sum([s.profit for s in sales]) or Decimal('0.000')
        
        # Expenses
        expenses = Expense.objects.filter(date__gte=start_date, date__lte=end_date)
        expenses_total = expenses.aggregate(total=Sum('amount'))['total'] or Decimal('0.000')
        expenses_by_category = {}
        for category, _ in Expense.EXPENSE_CATEGORIES:
            cat_total = expenses.filter(category=category).aggregate(
                total=Sum('amount')
            )['total'] or Decimal('0.000')
            expenses_by_category[category] = cat_total
        
        # Customer breakdown
        customer_sales = {}
        for sale in sales:
            cust_name = sale.customer.name
            if cust_name not in customer_sales:
                customer_sales[cust_name] = {
                    'kg': Decimal('0.000'),
                    'revenue': Decimal('0.000'),
                    'profit': Decimal('0.000'),
                }
            customer_sales[cust_name]['kg'] += sale.kg
            customer_sales[cust_name]['revenue'] += sale.total_amount
            customer_sales[cust_name]['profit'] += sale.profit
        
        return Response({
            'start_date': start_date,
            'end_date': end_date,
            'purchases_kg': purchases_kg,
            'purchases_cost': purchases_cost,
            'sales_kg': sales_kg,
            'sales_revenue': sales_revenue,
            'profit': profit,
            'cash_received': cash_received,
            'borrow': borrow,
            'expenses_total': expenses_total,
            'expenses_by_category': expenses_by_category,
            'customer_breakdown': customer_sales,
        })


class ExpenseReportView(APIView):
    """Generate expense report"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        category = request.query_params.get('category')
        
        expenses = Expense.objects.all()
        
        if start_date:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            expenses = expenses.filter(date__gte=start_date)
        
        if end_date:
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
            expenses = expenses.filter(date__lte=end_date)
        
        if category:
            expenses = expenses.filter(category=category)
        
        total_amount = expenses.aggregate(total=Sum('amount'))['total'] or Decimal('0.000')
        
        # Breakdown by category
        by_category = {}
        for cat, _ in Expense.EXPENSE_CATEGORIES:
            cat_total = expenses.filter(category=cat).aggregate(
                total=Sum('amount')
            )['total'] or Decimal('0.000')
            by_category[cat] = cat_total
        
        # Breakdown by date
        by_date = {}
        for expense in expenses:
            date_str = str(expense.date)
            if date_str not in by_date:
                by_date[date_str] = Decimal('0.000')
            by_date[date_str] += expense.amount
        
        return Response({
            'start_date': start_date,
            'end_date': end_date,
            'category': category,
            'total_amount': total_amount,
            'by_category': by_category,
            'by_date': by_date,
        })


class CustomerReportView(APIView):
    """Generate report for a specific customer"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, customer_id):
        try:
            customer = Customer.objects.get(id=customer_id)
        except Customer.DoesNotExist:
            return Response({'error': 'Customer not found'}, status=404)
        
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        sales = customer.sales.all()
        payments = customer.payments.all()
        
        if start_date:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            sales = sales.filter(date__gte=start_date)
            payments = payments.filter(date__gte=start_date)
        
        if end_date:
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
            sales = sales.filter(date__lte=end_date)
            payments = payments.filter(date__lte=end_date)
        
        total_sales_amount = sum([s.total_amount for s in sales]) or Decimal('0.000')
        total_payments = payments.aggregate(total=Sum('amount'))['total'] or Decimal('0.000')
        total_kg = sales.aggregate(total=Sum('kg'))['total'] or Decimal('0.000')
        
        return Response({
            'customer': {
                'id': customer.id,
                'name': customer.name,
                'opening_balance': customer.opening_balance,
                'running_balance': customer.running_balance,
            },
            'start_date': start_date,
            'end_date': end_date,
            'total_sales_amount': total_sales_amount,
            'total_payments': total_payments,
            'total_kg': total_kg,
            'outstanding': total_sales_amount - total_payments,
        })
