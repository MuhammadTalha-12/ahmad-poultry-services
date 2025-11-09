# Generated migration to convert supplier from text to ForeignKey

from django.db import migrations, models
import django.db.models.deletion
import django.core.validators
from decimal import Decimal


def migrate_suppliers_forward(apps, schema_editor):
    """Convert text supplier names to Supplier objects"""
    Purchase = apps.get_model('sales', 'Purchase')
    Supplier = apps.get_model('sales', 'Supplier')
    
    # Get all unique supplier names from purchases
    supplier_names = Purchase.objects.values_list('supplier_old', flat=True).distinct()
    
    # Create Supplier objects for each unique name
    for name in supplier_names:
        if name:  # Only create if name is not empty
            supplier, created = Supplier.objects.get_or_create(
                name=name,
                defaults={'phone': '', 'opening_balance': Decimal('0.000'), 'is_active': True}
            )
            # Update all purchases with this supplier name to link to the new Supplier object
            Purchase.objects.filter(supplier_old=name).update(supplier_new=supplier)


def migrate_suppliers_backward(apps, schema_editor):
    """Convert Supplier objects back to text names"""
    Purchase = apps.get_model('sales', 'Purchase')
    
    # Copy supplier names back to the old field
    for purchase in Purchase.objects.all():
        if purchase.supplier_new:
            purchase.supplier_old = purchase.supplier_new.name
            purchase.save()


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0003_payment_auto_allocated_customerdeduction'),
    ]

    operations = [
        # Step 1: Rename the old supplier field
        migrations.RenameField(
            model_name='purchase',
            old_name='supplier',
            new_name='supplier_old',
        ),
        
        # Step 2: Add amount_paid field to Purchase
        migrations.AddField(
            model_name='purchase',
            name='amount_paid',
            field=models.DecimalField(
                decimal_places=3,
                default=Decimal('0.000'),
                help_text='Amount paid to supplier for this purchase',
                max_digits=12,
                validators=[django.core.validators.MinValueValidator(Decimal('0.000'))],
            ),
        ),
        
        # Step 3: Create Supplier model
        migrations.CreateModel(
            name='Supplier',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(db_index=True, max_length=255, unique=True)),
                ('phone', models.CharField(blank=True, max_length=20)),
                ('opening_balance', models.DecimalField(
                    decimal_places=3,
                    default=Decimal('0.000'),
                    help_text='Opening balance we owe to supplier',
                    max_digits=12,
                    validators=[django.core.validators.MinValueValidator(Decimal('0.000'))],
                )),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['name'],
                'indexes': [
                    models.Index(fields=['name'], name='sales_suppl_name_4ca1b2_idx'),
                    models.Index(fields=['is_active'], name='sales_suppl_is_acti_1eb811_idx'),
                ],
            },
        ),
        
        # Step 4: Add new ForeignKey field (nullable temporarily)
        migrations.AddField(
            model_name='purchase',
            name='supplier_new',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='purchases',
                to='sales.supplier',
            ),
        ),
        
        # Step 5: Run data migration
        migrations.RunPython(migrate_suppliers_forward, migrate_suppliers_backward),
        
        # Step 6: Remove old text field
        migrations.RemoveField(
            model_name='purchase',
            name='supplier_old',
        ),
        
        # Step 7: Rename new field to supplier
        migrations.RenameField(
            model_name='purchase',
            old_name='supplier_new',
            new_name='supplier',
        ),
        
        # Step 8: Add indexes for Purchase
        migrations.AddIndex(
            model_name='purchase',
            index=models.Index(fields=['supplier', 'date'], name='sales_purch_supplie_d4c096_idx'),
        ),
        
        # Step 9: Create SupplierPayment model
        migrations.CreateModel(
            name='SupplierPayment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(db_index=True)),
                ('amount', models.DecimalField(
                    decimal_places=3,
                    help_text='Payment amount to supplier',
                    max_digits=12,
                    validators=[django.core.validators.MinValueValidator(Decimal('0.001'))],
                )),
                ('method', models.CharField(
                    choices=[('cash', 'Cash'), ('bank', 'Bank Transfer'), ('other', 'Other')],
                    default='cash',
                    max_length=20,
                )),
                ('note', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('supplier', models.ForeignKey(
                    on_delete=django.db.models.deletion.PROTECT,
                    related_name='supplier_payments',
                    to='sales.supplier',
                )),
            ],
            options={
                'ordering': ['-date', '-created_at'],
            },
        ),
        
        # Step 10: Add indexes for SupplierPayment
        migrations.AddIndex(
            model_name='supplierpayment',
            index=models.Index(fields=['date'], name='sales_suppl_date_a8eeba_idx'),
        ),
        migrations.AddIndex(
            model_name='supplierpayment',
            index=models.Index(fields=['supplier', 'date'], name='sales_suppl_supplie_eaa9a1_idx'),
        ),
        migrations.AddIndex(
            model_name='supplierpayment',
            index=models.Index(fields=['-date', '-created_at'], name='sales_suppl_date_3f64f5_idx'),
        ),
    ]
