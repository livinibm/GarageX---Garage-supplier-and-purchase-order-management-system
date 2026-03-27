#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def debug_current_state():
    print("=== DEBUGGING CURRENT STATE ===")
    
    try:
        from supplier.models import PurchaseOrder
        from django.db import connection
        
        # 1. Check table structure
        print("\n1. TABLE STRUCTURE:")
        with connection.cursor() as cursor:
            cursor.execute("DESCRIBE supplier_purchaseorder")
            columns = cursor.fetchall()
            for col in columns:
                print(f"  {col[0]} - {col[1]}")
        
        # 2. Check data in table
        print("\n2. DATA IN TABLE:")
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM supplier_purchaseorder")
            rows = cursor.fetchall()
            print(f"  Total rows: {len(rows)}")
            for i, row in enumerate(rows[:3]):
                print(f"  Row {i+1}: {row}")
        
        # 3. Try Django model query
        print("\n3. DJANGO MODEL QUERY:")
        try:
            orders = PurchaseOrder.objects.all()
            print(f"  Django found {orders.count()} orders")
            
            for order in orders[:3]:
                print(f"  Order: {order.po_reference_number}, Status: {order.status}")
                print(f"    Supplier ID: {order.supplier_id_id if hasattr(order.supplier_id, 'id') else order.supplier_id}")
                print(f"    Created By ID: {order.created_by_user_id_id if hasattr(order.created_by_user_id, 'id') else order.created_by_user_id}")
                
        except Exception as e:
            print(f"  Django query error: {e}")
            import traceback
            traceback.print_exc()
        
        # 4. Test serializer
        print("\n4. SERIALIZER TEST:")
        try:
            from supplier.serializers import PurchaseOrderSerializer
            orders = PurchaseOrder.objects.all()[:1]
            if orders:
                serializer = PurchaseOrderSerializer(orders[0])
                print(f"  Serialized data: {serializer.data}")
        except Exception as e:
            print(f"  Serializer error: {e}")
            import traceback
            traceback.print_exc()
            
    except Exception as e:
        print(f"Setup error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    debug_current_state()
