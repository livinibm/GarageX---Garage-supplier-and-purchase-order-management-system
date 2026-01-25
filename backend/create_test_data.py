import os
import django
from datetime import datetime, timedelta
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from supplier.models import Supplier, Part
from payment.models import Payment, Invoice
from django.contrib.auth import get_user_model

User = get_user_model()

print("Creating comprehensive test data for Reports page...")

# Get or create suppliers
supplier_user1 = User.objects.filter(username='supplier_demo').first()
supplier_user2 = User.objects.filter(username='supplier1').first()

if not supplier_user1:
    print("❌ supplier_demo not found. Run seed_data.py first")
    exit(1)

supplier1 = Supplier.objects.filter(user=supplier_user1).first()
supplier2 = Supplier.objects.filter(user=supplier_user2).first() if supplier_user2 else None

# Create more parts with varying stock levels
parts_data = [
    ("Engine Oil 5W-30", "EO-5W30", "ENGINE", 45.99, 5, 20, supplier1),
    ("Air Filter", "AF-001", "ENGINE", 25.50, 2, 15, supplier1),
    ("Brake Rotor", "BR-002", "BRAKE", 89.99, 8, 10, supplier1),
    ("Headlight Bulb", "HB-H7", "ELECTRICAL", 15.99, 3, 25, supplier1),
    ("Shock Absorber", "SA-FR", "SUSPENSION", 125.00, 12, 8, supplier1),
]

if supplier2:
    parts_data.extend([
        ("Transmission Fluid", "TF-ATF", "TRANSMISSION", 35.00, 1, 10, supplier2),
        ("Wiper Blade Set", "WB-22", "OTHER", 18.50, 20, 15, supplier2),
    ])

print(f"\nCreating {len(parts_data)} parts...")
for name, part_num, ptype, price, stock, min_stock, sup in parts_data:
    part, created = Part.objects.update_or_create(
        part_number=part_num,
        defaults={
            'name': name,
            'part_type': ptype,
            'price': Decimal(str(price)),
            'stock_quantity': stock,
            'min_stock_level': min_stock,
            'supplier': sup,
            'is_active': True
        }
    )
    status = "✅ Created" if created else "🔄 Updated"
    print(f"  {status}: {name} (Stock: {stock}, Min: {min_stock})")

# Create payments for last 6 months
print("\n\nCreating monthly payment data...")
today = datetime.now().date()
payments_created = 0

for month_offset in range(6):
    payment_date = today - timedelta(days=30 * month_offset)
    
    # Multiple payments per month
    for i in range(3):
        amount = Decimal(str(500 + (month_offset * 100) + (i * 200)))
        supplier_name = supplier1.company_name if i % 2 == 0 else (supplier2.company_name if supplier2 else supplier1.company_name)
        
        payment = Payment.objects.create(
            supplier=supplier_name,
            amount=amount,
            date=payment_date - timedelta(days=i * 3),
            method='Bank Transfer',
            status='Completed'
        )
        payments_created += 1

print(f"✅ Created {payments_created} payments across 6 months")

# Create some pending payments
print("\nCreating pending payments...")
pending_payments = [
    (supplier1.company_name, 1500.00, today - timedelta(days=5)),
    (supplier1.company_name, 850.00, today - timedelta(days=2)),
]

if supplier2:
    pending_payments.append((supplier2.company_name, 2200.00, today - timedelta(days=3)))

for sup_name, amount, pdate in pending_payments:
    Payment.objects.create(
        supplier=sup_name,
        amount=Decimal(str(amount)),
        date=pdate,
        method='Bank Transfer',
        status='Pending'
    )
    print(f"  ⏳ Pending payment: ${amount} to {sup_name}")

# Create invoices including overdue ones
print("\nCreating invoices (including overdue)...")
invoices_data = [
    (supplier1.company_name, "PO-2025-101", 2500.00, today - timedelta(days=30), "Unpaid"),  # Overdue
    (supplier1.company_name, "PO-2025-102", 1800.00, today - timedelta(days=15), "Unpaid"),  # Overdue
    (supplier1.company_name, "PO-2025-103", 3200.00, today + timedelta(days=10), "Unpaid"),  # Future
    (supplier1.company_name, "PO-2025-104", 950.00, today - timedelta(days=5), "Paid"),
]

if supplier2:
    invoices_data.extend([
        (supplier2.company_name, "PO-2025-201", 1200.00, today - timedelta(days=20), "Unpaid"),  # Overdue
        (supplier2.company_name, "PO-2025-202", 750.00, today + timedelta(days=5), "Unpaid"),
    ])

for sup_name, order, amount, due, status in invoices_data:
    invoice, created = Invoice.objects.update_or_create(
        order=order,
        defaults={
            'supplier': sup_name,
            'amount': Decimal(str(amount)),
            'due_date': due,
            'status': status
        }
    )
    emoji = "🔴" if invoice.is_overdue else ("✅" if status == "Paid" else "📄")
    print(f"  {emoji} {order}: ${amount} - {status} (Due: {due})")

print("\n" + "="*60)
print("✅ Test data creation complete!")
print("="*60)
print("\nYou should now see:")
print("  📊 Monthly purchase data across 6 months")
print("  🏢 Supplier spending breakdown")
print("  ⚠️  Low stock alerts (parts below minimum level)")
print("  ⏳ Pending payment notifications")
print("  🔴 Overdue invoice alerts")
print("\nLogin with: supplier1 / supplier123")
print("Visit Reports page to see the data!")
