#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def simple_model_test():
    print("=== SIMPLE MODEL TEST ===")
    
    try:
        # Test without foreign keys first
        from django.db import connection
        
        print("\n1. RAW SQL TEST:")
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT id, po_reference_number, supplier_id, created_by_user_id, 
                       order_date, expected_delivery_date, total_amount, status 
                FROM supplier_purchaseorder 
                LIMIT 3
            """)
            rows = cursor.fetchall()
            print(f"  Raw SQL found {len(rows)} rows")
            for row in rows:
                print(f"    {row}")
        
        # Test Django model without relationships
        print("\n2. DJANGO MODEL TEST (no relationships):")
        from supplier.models import PurchaseOrder
        
        orders = PurchaseOrder.objects.all().values(
            'id', 'po_reference_number', 'supplier_id', 'created_by_user_id',
            'order_date', 'expected_delivery_date', 'total_amount', 'status'
        )[:3]
        
        print(f"  Django values query found {len(orders)} rows")
        for order in orders:
            print(f"    {order}")
            
        # Test with select_related but only basic fields
        print("\n3. DJANGO WITH SELECT_RELATED:")
        orders = PurchaseOrder.objects.select_related().all()[:3]
        print(f"  Found {len(orders)} orders with select_related")
        
        for order in orders:
            try:
                print(f"    Order: {order.po_reference_number}")
                print(f"    Status: {order.status}")
                print(f"    Supplier: {order.supplier_id}")
                print(f"    Created by: {order.created_by_user_id}")
            except Exception as e:
                print(f"    Error accessing order fields: {e}")
                
    except Exception as e:
        print(f"Test error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    simple_model_test()
