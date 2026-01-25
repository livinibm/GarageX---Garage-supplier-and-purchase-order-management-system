import os
import django
import sys
import datetime
from django.utils import timezone

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from accounts.models import Profile
from supplier.models import Supplier, Part
from payment.models import Payment, Invoice

def create_supplier_data():
    print("Seeding data...")

    # 1. Create Supplier User
    username = "supplier_demo"
    email = "demo@autoparts.com"
    password = "password123"
    
    user, created = User.objects.get_or_create(username=username, email=email)
    if created:
        user.set_password(password)
        user.save()
        print(f"Created user: {username}")
    else:
        print(f"User {username} already exists")

    # 2. Create Profile
    profile, created = Profile.objects.get_or_create(user=user)
    profile.role = 'SUPPLIER'
    profile.phone = "555-0100"
    profile.save()
    print(f"Updated profile for {username}")

    # 3. Create Supplier Entity
    supplier, created = Supplier.objects.get_or_create(
        user=user,
        defaults={
            'company_name': "AutoParts Co.",
            'contact_person': "John Smith",
            'phone': "555-0100",
            'email': email,
            'address': "123 Industrial Park, NY"
        }
    )
    if created:
        print(f"Created supplier: {supplier.company_name}")
    else:
        print(f"Supplier {supplier.company_name} already exists")

    # 4. Create Parts
    parts_data = [
        {'name': 'Brake Pad Set', 'part_number': 'BP-001', 'part_type': 'BRAKE', 'price': 45.00, 'stock': 120, 'min': 20},
        {'name': 'Oil Filter', 'part_number': 'OF-055', 'part_type': 'ENGINE', 'price': 12.50, 'stock': 500, 'min': 50},
        {'name': 'Alternator', 'part_number': 'ALT-200', 'part_type': 'ELECTRICAL', 'price': 150.00, 'stock': 15, 'min': 5},
        {'name': 'Spark Plug', 'part_number': 'SP-99', 'part_type': 'ENGINE', 'price': 8.00, 'stock': 200, 'min': 40},
    ]

    for p_data in parts_data:
        part, created = Part.objects.get_or_create(
            part_number=p_data['part_number'],
            defaults={
                'name': p_data['name'],
                'description': f"High quality {p_data['name']}",
                'part_type': p_data['part_type'],
                'price': p_data['price'],
                'stock_quantity': p_data['stock'],
                'min_stock_level': p_data['min'],
                'supplier': supplier,
                'is_active': True
            }
        )
        if created:
            print(f"Created part: {part.name}")

    # 5. Create Payments (History)
    payments_data = [
        {'amount': 2450.00, 'date': timezone.now() - datetime.timedelta(days=2), 'method': 'Bank Transfer', 'status': 'Completed'},
        {'amount': 840.00, 'date': timezone.now() - datetime.timedelta(days=5), 'method': 'Card', 'status': 'Pending'},
        {'amount': 150.00, 'date': timezone.now() - datetime.timedelta(days=10), 'method': 'Cash', 'status': 'Completed'},
    ]

    for pay in payments_data:
        Payment.objects.create(
            supplier=supplier,
            amount=pay['amount'],
            date=pay['date'],
            method=pay['method'],
            status=pay['status']
        )
    print(f"Created {len(payments_data)} payments")

    # 6. Create Invoices
    invoices_data = [
        {'order': 'PO-9001', 'amount': 2450.00, 'due': timezone.now() + datetime.timedelta(days=30), 'status': 'Paid'},
        {'order': 'PO-9005', 'amount': 840.00, 'due': timezone.now() + datetime.timedelta(days=15), 'status': 'Unpaid'},
        {'order': 'PO-8990', 'amount': 1150.00, 'due': timezone.now() - datetime.timedelta(days=5), 'status': 'Unpaid'}, # Overdue
    ]

    for inv in invoices_data:
        Invoice.objects.create(
            supplier=supplier,
            order=inv['order'],
            amount=inv['amount'],
            due_date=inv['due'],
            status=inv['status']
        )
    print(f"Created {len(invoices_data)} invoices")

    print("\n✅ Seed data creation complete!")
    print(f"Login with: {username} / {password}")

if __name__ == '__main__':
    create_supplier_data()
