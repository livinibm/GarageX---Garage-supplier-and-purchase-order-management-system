#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection
from supplier.models import PurchaseOrder

def check_database():
    print("Checking database...")
    
    # Check if tables exist
    with connection.cursor() as cursor:
        cursor.execute("SHOW TABLES LIKE '%purchaseorder%'")
        tables = cursor.fetchall()
        print(f"Purchase order tables: {tables}")
        
        if tables:
            cursor.execute("DESCRIBE supplier_purchaseorder")
            columns = cursor.fetchall()
            print("Purchase order table columns:")
            for col in columns:
                print(f"  {col[0]} - {col[1]}")
    
    # Try to query purchase orders
    try:
        orders = PurchaseOrder.objects.all()
        print(f"Found {orders.count()} purchase orders")
        
        for order in orders[:3]:
            print(f"Order: {order.order_number}, Status: {order.status}")
            # Check if new fields exist
            try:
                print(f"  Approved by: {order.approved_by}")
                print(f"  Approved date: {order.approved_date}")
                print(f"  Rejection reason: {order.rejection_reason}")
            except AttributeError as e:
                print(f"  Missing field: {e}")
                
    except Exception as e:
        print(f"Error querying purchase orders: {e}")

if __name__ == '__main__':
    check_database()
