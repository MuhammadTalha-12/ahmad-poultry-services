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
        
        # Purchases by vehicle
        purchases_by_vehicle = {}
        for purchase in purchases:
            vehicle = purchase.vehicle_number or 'Not Specified'
            if vehicle not in purchases_by_vehicle:
                purchases_by_vehicle[vehicle] = {
                    'kg': Decimal('0.000'),
                    'cost': Decimal('0.000'),
                    'count': 0
                }
            purchases_by_vehicle[vehicle]['kg'] += purchase.kg
            purchases_by_vehicle[vehicle]['cost'] += purchase.total_cost
            purchases_by_vehicle[vehicle]['count'] += 1
        
        # Sales
        sales = Sale.objects.filter(date=report_date)
        sales_kg = sales.aggregate(total=Sum('kg'))['total'] or Decimal('0.000')
        sales_revenue = sum([s.total_amount for s in sales]) or Decimal('0.000')
        cash_from_sales = sales.aggregate(total=Sum('amount_received'))['total'] or Decimal('0.000')
        borrow = sales_revenue - cash_from_sales
        profit = sum([s.profit for s in sales]) or Decimal('0.000')
        
        # Payments (cash received separately from sales)
        payments = Payment.objects.filter(date=report_date)
        cash_from_payments = payments.aggregate(total=Sum('amount'))['total'] or Decimal('0.000')
        
        # Total cash received = cash from sales + payments received
        total_cash_received = cash_from_sales + cash_from_payments
        
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
            'purchases_by_vehicle': purchases_by_vehicle,
            'sales_kg': sales_kg,
            'sales_revenue': sales_revenue,
            'profit': profit,
            'cash_received': total_cash_received,
            'cash_from_sales': cash_from_sales,
            'cash_from_payments': cash_from_payments,
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
        
        # Customer breakdown with running balance
        customer_sales = {}
        for sale in sales:
            cust_name = sale.customer.name
            if cust_name not in customer_sales:
                customer_sales[cust_name] = {
                    'kg': Decimal('0.000'),
                    'revenue': Decimal('0.000'),
                    'profit': Decimal('0.000'),
                    'running_balance': sale.customer.running_balance,  # Grand closing balance
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


class SalesAnalyticsView(APIView):
    """Generate sales analytics for selected dates - total kgs sold and sale price"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if not start_date or not end_date:
            return Response({
                'error': 'start_date and end_date are required'
            }, status=400)
        
        try:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        except ValueError:
            return Response({
                'error': 'Invalid date format. Use YYYY-MM-DD'
            }, status=400)
        
        # Get sales within date range
        sales = Sale.objects.filter(date__gte=start_date, date__lte=end_date)
        
        if not sales.exists():
            return Response({
                'date_range': {
                    'start_date': start_date,
                    'end_date': end_date,
                },
                'analytics': {
                    'total_kgs_sold': Decimal('0.000'),
                    'total_sale_price': Decimal('0.000'),
                    'total_sales_count': 0,
                    'average_rate_per_kg': Decimal('0.000'),
                    'total_profit': Decimal('0.000'),
                },
                'message': 'No sales found for the selected date range'
            })
        
        # Calculate analytics
        total_kgs_sold = sales.aggregate(total=Sum('kg'))['total'] or Decimal('0.000')
        total_sale_price = sum([s.total_amount for s in sales]) or Decimal('0.000')
        total_sales_count = sales.count()
        total_profit = sum([s.profit for s in sales]) or Decimal('0.000')
        
        # Calculate average rate per kg
        average_rate_per_kg = Decimal('0.000')
        if total_kgs_sold > 0:
            average_rate_per_kg = total_sale_price / total_kgs_sold
        
        # Daily breakdown
        daily_breakdown = {}
        for sale in sales:
            date_str = str(sale.date)
            if date_str not in daily_breakdown:
                daily_breakdown[date_str] = {
                    'total_kgs': Decimal('0.000'),
                    'total_sale_price': Decimal('0.000'),
                    'sales_count': 0,
                    'total_profit': Decimal('0.000'),
                }
            daily_breakdown[date_str]['total_kgs'] += sale.kg
            daily_breakdown[date_str]['total_sale_price'] += sale.total_amount
            daily_breakdown[date_str]['sales_count'] += 1
            daily_breakdown[date_str]['total_profit'] += sale.profit
        
        # Top customers by sales volume
        customer_breakdown = {}
        for sale in sales:
            customer_name = sale.customer.name
            if customer_name not in customer_breakdown:
                customer_breakdown[customer_name] = {
                    'total_kgs': Decimal('0.000'),
                    'total_sale_price': Decimal('0.000'),
                    'sales_count': 0,
                }
            customer_breakdown[customer_name]['total_kgs'] += sale.kg
            customer_breakdown[customer_name]['total_sale_price'] += sale.total_amount
            customer_breakdown[customer_name]['sales_count'] += 1
        
        # Sort top customers by total sale price
        top_customers = sorted(
            customer_breakdown.items(), 
            key=lambda x: x[1]['total_sale_price'], 
            reverse=True
        )[:10]  # Top 10 customers
        
        return Response({
            'date_range': {
                'start_date': start_date,
                'end_date': end_date,
            },
            'analytics': {
                'total_kgs_sold': total_kgs_sold,
                'total_sale_price': total_sale_price,
                'total_sales_count': total_sales_count,
                'average_rate_per_kg': average_rate_per_kg,
                'total_profit': total_profit,
            },
            'daily_breakdown': daily_breakdown,
            'top_customers': dict(top_customers),
        })
