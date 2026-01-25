"""
Test script to create sample data for Member 5 features
Run this after migrating the database to populate with test data
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from payment.models import Payment, Invoice
from supplier.models import Supplier, Part
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Create sample data for Member 5 testing'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating sample data for Member 5...')

        # Ensure we have at least one supplier (if not, create test suppliers)
        if Supplier.objects.count() == 0:
            self.stdout.write('Creating test suppliers...')
            # Create test user for supplier
            if not User.objects.filter(username='supplier1').exists():
                user1 = User.objects.create_user('supplier1', 'supplier1@test.com', 'pass123')
            else:
                user1 = User.objects.get(username='supplier1')
                
            if not User.objects.filter(username='supplier2').exists():
                user2 = User.objects.create_user('supplier2', 'supplier2@test.com', 'pass123')
            else:
                user2 = User.objects.get(username='supplier2')

            supplier1 = Supplier.objects.create(
                user=user1,
                company_name='Auto Parts Co',
                contact_person='John Smith',
                phone='555-0101',
                email='john@autoparts.com',
                address='123 Main St, City',
                is_active=True
            )

            supplier2 = Supplier.objects.create(
                user=user2,
                company_name='Prime Supply',
                contact_person='Jane Doe',
                phone='555-0102',
                email='jane@primesupply.com',
                address='456 Oak Ave, Town',
                is_active=True
            )
            
            self.stdout.write(self.style.SUCCESS('Created 2 test suppliers'))
        else:
            supplier1 = Supplier.objects.first()
            supplier2 = Supplier.objects.last() if Supplier.objects.count() > 1 else supplier1

        # Create sample payments
        if Payment.objects.count() == 0:
            self.stdout.write('Creating sample payments...')
            
            Payment.objects.create(
                supplier=supplier1.company_name,
                amount=Decimal('1250.00'),
                date=timezone.now().date() - timedelta(days=10),
                method='Bank Transfer',
                status='Completed'
            )

            Payment.objects.create(
                supplier=supplier2.company_name,
                amount=Decimal('875.50'),
                date=timezone.now().date() - timedelta(days=5),
                method='Card',
                status='Completed'
            )

            Payment.objects.create(
                supplier=supplier1.company_name,
                amount=Decimal('2100.00'),
                date=timezone.now().date() - timedelta(days=2),
                method='Bank Transfer',
                status='Pending'
            )

            Payment.objects.create(
                supplier=supplier2.company_name,
                amount=Decimal('450.00'),
                date=timezone.now().date(),
                method='Cash',
                status='Pending'
            )

            self.stdout.write(self.style.SUCCESS('Created 4 sample payments'))

        # Create sample invoices
        if Invoice.objects.count() == 0:
            self.stdout.write('Creating sample invoices...')

            Invoice.objects.create(
                supplier=supplier1.company_name,
                order='PO-2025-001',
                amount=Decimal('3200.00'),
                status='Unpaid',
                due_date=timezone.now().date() + timedelta(days=30)
            )

            Invoice.objects.create(
                supplier=supplier2.company_name,
                order='PO-2025-002',
                amount=Decimal('1800.00'),
                status='Paid',
                due_date=timezone.now().date() - timedelta(days=5)
            )

            Invoice.objects.create(
                supplier=supplier1.company_name,
                order='PO-2024-098',
                amount=Decimal('5400.00'),
                status='Unpaid',
                due_date=timezone.now().date() - timedelta(days=10)  # Overdue
            )

            Invoice.objects.create(
                supplier=supplier2.company_name,
                order='PO-2025-003',
                amount=Decimal('920.00'),
                status='Partial',
                due_date=timezone.now().date() + timedelta(days=15)
            )

            self.stdout.write(self.style.SUCCESS('Created 4 sample invoices'))

        # Create sample parts for stock tracking
        if Part.objects.count() == 0:
            self.stdout.write('Creating sample parts...')

            Part.objects.create(
                name='Brake Pads - Front',
                part_number='BP-F-2024',
                description='High-performance ceramic brake pads for front wheels',
                part_type='BRAKE',
                price=Decimal('89.99'),
                stock_quantity=25,
                min_stock_level=10,
                supplier=supplier1,
                is_active=True
            )

            Part.objects.create(
                name='Engine Oil Filter',
                part_number='EOF-STD-2024',
                description='Standard engine oil filter',
                part_type='ENGINE',
                price=Decimal('12.50'),
                stock_quantity=5,  # Low stock
                min_stock_level=15,
                supplier=supplier2,
                is_active=True
            )

            Part.objects.create(
                name='Air Filter',
                part_number='AF-2024',
                description='Cabin air filter replacement',
                part_type='ENGINE',
                price=Decimal('18.75'),
                stock_quantity=8,  # Low stock
                min_stock_level=12,
                supplier=supplier1,
                is_active=True
            )

            Part.objects.create(
                name='Spark Plugs (Set of 4)',
                part_number='SP-4PK-2024',
                description='Iridium spark plugs',
                part_type='ENGINE',
                price=Decimal('45.00'),
                stock_quantity=30,
                min_stock_level=8,
                supplier=supplier2,
                is_active=True
            )

            Part.objects.create(
                name='Wiper Blades',
                part_number='WB-PAIR-2024',
                description='All-season wiper blade pair',
                part_type='BODY',
                price=Decimal('24.99'),
                stock_quantity=3,  # Very low stock
                min_stock_level=10,
                supplier=supplier1,
                is_active=True
            )

            self.stdout.write(self.style.SUCCESS('Created 5 sample parts'))

        self.stdout.write(self.style.SUCCESS('Sample data creation complete!'))
        self.stdout.write('You can now test the Member 5 features.')
