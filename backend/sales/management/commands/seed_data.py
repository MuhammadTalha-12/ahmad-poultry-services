from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal
from datetime import timedelta, date
from faker import Faker
import random

from sales.models import Customer, DailyRate, Purchase, Sale, Payment, Expense

User = get_user_model()
fake = Faker()


class Command(BaseCommand):
    help = 'Seed database with sample data for Ahmad Poultry Services'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding database...')
        
        # Create superuser
        self.create_users()
        
        # Create customers
        customers = self.create_customers()
        
        # Create 30 days of data
        self.create_daily_data(customers)
        
        self.stdout.write(self.style.SUCCESS('Database seeded successfully!'))

    def create_users(self):
        """Create admin and regular users"""
        if not User.objects.filter(email='admin@example.com').exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@example.com',
                password='Admin@123'
            )
            self.stdout.write(self.style.SUCCESS('Created admin user: admin@example.com / Admin@123'))
        
        if not User.objects.filter(email='user@example.com').exists():
            User.objects.create_user(
                username='user',
                email='user@example.com',
                password='User@123'
            )
            self.stdout.write(self.style.SUCCESS('Created regular user: user@example.com / User@123'))

    def create_customers(self):
        """Create 25 sample customers"""
        customers = []
        customer_names = [
            "Ali Traders", "Bismillah Store", "City Chicken Shop", "Daud Retailers",
            "Excel Mart", "Farid Poultry", "Green Valley Store", "Hassan Brothers",
            "Imperial Foods", "Jamil Traders", "Kareem Store", "Lucky Chicken",
            "Mehran Traders", "New Star Shop", "Omar Retailers", "Paradise Store",
            "Quality Mart", "Rehman Poultry", "Super Store", "Tahir Traders",
            "United Foods", "Victory Shop", "Waseem Store", "Xpress Mart", "Zain Traders"
        ]
        
        for name in customer_names:
            if not Customer.objects.filter(name=name).exists():
                customer = Customer.objects.create(
                    name=name,
                    phone=fake.phone_number()[:20],
                    address=fake.address()[:200],
                    opening_balance=Decimal(str(random.randint(0, 50000))),
                    is_active=True
                )
                customers.append(customer)
                self.stdout.write(f'Created customer: {name}')
        
        return Customer.objects.all()

    def create_daily_data(self, customers):
        """Create 30 days of purchases, sales, payments, and expenses"""
        today = date.today()
        
        for day_offset in range(30, 0, -1):
            current_date = today - timedelta(days=day_offset)
            
            # Create daily rate
            cost_rate = Decimal(str(random.uniform(180, 220)))
            sale_rate = cost_rate + Decimal(str(random.uniform(20, 40)))
            
            DailyRate.objects.get_or_create(
                date=current_date,
                defaults={
                    'default_cost_rate': cost_rate,
                    'default_sale_rate': sale_rate,
                }
            )
            
            # Create 1-3 purchases per day
            for _ in range(random.randint(1, 3)):
                Purchase.objects.create(
                    date=current_date,
                    supplier=random.choice(['Poultry Farm A', 'Farm B', 'Local Supplier', 'XYZ Farm']),
                    kg=Decimal(str(random.randint(50, 300))),
                    cost_rate_per_kg=cost_rate + Decimal(str(random.uniform(-5, 5))),
                    note=fake.sentence() if random.random() > 0.7 else ''
                )
            
            # Create 5-15 sales per day
            daily_customers = random.sample(list(customers), random.randint(5, 15))
            for customer in daily_customers:
                kg = Decimal(str(random.randint(5, 100)))
                total_amount = kg * sale_rate
                amount_received = total_amount * Decimal(str(random.uniform(0.5, 1.0)))
                
                Sale.objects.create(
                    date=current_date,
                    customer=customer,
                    kg=kg,
                    sale_rate_per_kg=sale_rate + Decimal(str(random.uniform(-5, 5))),
                    cost_rate_snapshot=cost_rate,
                    amount_received=amount_received,
                    note=fake.sentence() if random.random() > 0.8 else ''
                )
            
            # Create 2-8 payments per day
            payment_customers = random.sample(list(customers), random.randint(2, 8))
            for customer in payment_customers:
                Payment.objects.create(
                    date=current_date,
                    customer=customer,
                    amount=Decimal(str(random.randint(1000, 20000))),
                    method=random.choice(['cash', 'bank', 'other']),
                    note=fake.sentence() if random.random() > 0.8 else ''
                )
            
            # Create 1-4 expenses per day
            for _ in range(random.randint(1, 4)):
                category = random.choice(['van_repair', 'feed', 'salary', 'petrol', 'other'])
                Expense.objects.create(
                    date=current_date,
                    category=category,
                    amount=Decimal(str(random.randint(500, 5000))),
                    note=fake.sentence() if random.random() > 0.7 else ''
                )
            
            self.stdout.write(f'Created data for {current_date}')
        
        self.stdout.write(self.style.SUCCESS('Created 30 days of transaction data'))

