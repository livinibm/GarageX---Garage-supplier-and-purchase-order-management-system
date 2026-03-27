from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from supplier.models import PurchaseOrder, Supplier
from django.utils import timezone
import random

class Command(BaseCommand):
    help = 'Add sample purchase orders for testing'

    def handle(self, *args, **options):
        self.stdout.write('Adding sample purchase orders...')
        
        # Get or check users and suppliers
        users = User.objects.all()
        suppliers = Supplier.objects.all()
        
        if not users.exists():
            self.stdout.write(self.style.ERROR('No users found. Please create users first.'))
            return
            
        if not suppliers.exists():
            self.stdout.write(self.style.ERROR('No suppliers found. Please create suppliers first.'))
            return
        
        # Clear existing orders (optional)
        PurchaseOrder.objects.all().delete()
        
        sample_orders = [
            {
                'order_number': 'PO-4001',
                'supplier': suppliers.first(),
                'ordered_by': users.first(),
                'total_amount': 50000.00,
                'status': 'PENDING',
                'notes': 'Sample order for testing approval workflow'
            },
            {
                'order_number': 'PO-4002',
                'supplier': suppliers.first() if suppliers.count() > 0 else suppliers.first(),
                'ordered_by': users.first(),
                'total_amount': 25000.00,
                'status': 'APPROVED',
                'notes': 'Approved order ready for processing',
                'approved_by': users.first(),
                'approved_date': timezone.now()
            },
            {
                'order_number': 'PO-4003',
                'supplier': suppliers.last() if suppliers.count() > 1 else suppliers.first(),
                'ordered_by': users.first(),
                'total_amount': 15000.00,
                'status': 'REJECTED',
                'notes': 'Rejected due to budget constraints',
                'approved_by': users.first(),
                'approved_date': timezone.now(),
                'rejection_reason': 'Budget exceeded - need management approval'
            },
            {
                'order_number': 'PO-4004',
                'supplier': suppliers.first(),
                'ordered_by': users.first(),
                'total_amount': 35000.00,
                'status': 'ORDERED',
                'notes': 'Order placed with supplier - awaiting delivery',
                'approved_by': users.first(),
                'approved_date': timezone.now()
            }
        ]
        
        created_count = 0
        for order_data in sample_orders:
            try:
                order = PurchaseOrder.objects.create(**order_data)
                created_count += 1
                self.stdout.write(f'Created order: {order.order_number} - {order.status}')
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error creating order {order_data["order_number"]}: {e}'))
        
        self.stdout.write(self.style.SUCCESS(f'Successfully created {created_count} sample purchase orders'))
        
        # Verify
        total_orders = PurchaseOrder.objects.count()
        self.stdout.write(f'Total purchase orders in database: {total_orders}')
