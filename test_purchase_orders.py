#!/usr/bin/env python
import os
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from supplier.models import PurchaseOrder, Supplier
from django.contrib.auth.models import User

def test_purchase_orders():
    print("Testing Purchase Orders...")
    
    # Check if we have any purchase orders
    orders = PurchaseOrder.objects.all()
    print(f"Total purchase orders: {orders.count()}")
    
    # Check suppliers
    suppliers = Supplier.objects.all()
    print(f"Total suppliers: {suppliers.count()}")
    
    # Check users
    users = User.objects.all()
    print(f"Total users: {users.count()}")
    
    # Show sample orders
    for order in orders[:3]:
        print(f"Order: {order.order_number}, Status: {order.status}, Supplier: {order.supplier.company_name if order.supplier else 'None'}")

if __name__ == '__main__':
    test_purchase_orders()
