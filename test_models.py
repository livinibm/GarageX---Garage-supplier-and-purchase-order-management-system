#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def test_models():
    print("=== TESTING MODELS ===")
    
    try:
        from supplier.models import PurchaseOrder, Supplier
        
        # Test Supplier model
        print("\n1. Testing Supplier model:")
        try:
            suppliers = Supplier.objects.all()
            print(f"  Found {suppliers.count()} suppliers")
            for supplier in suppliers[:3]:
                print(f"    {supplier.supplier_id}: {supplier.supplier_name}")
        except Exception as e:
            print(f"  Supplier model error: {e}")
            import traceback
            traceback.print_exc()
        
        # Test PurchaseOrder model
        print("\n2. Testing PurchaseOrder model:")
        try:
            orders = PurchaseOrder.objects.all()
            print(f"  Found {orders.count()} orders")
            for order in orders[:3]:
                print(f"    Order {order.order_id}: Supplier {order.supplier_id}, Status {order.status}")
                
                # Test supplier property
                try:
                    supplier = order.supplier
                    print(f"      Supplier name: {supplier.supplier_name if supplier else 'None'}")
                except Exception as e:
                    print(f"      Supplier property error: {e}")
                    
        except Exception as e:
            print(f"  PurchaseOrder model error: {e}")
            import traceback
            traceback.print_exc()
            
        # Test raw SQL
        print("\n3. Testing raw SQL:")
        try:
            from django.db import connection
            with connection.cursor() as cursor:
                cursor.execute("SELECT COUNT(*) FROM purchase_orders")
                count = cursor.fetchone()[0]
                print(f"  Raw SQL found {count} orders")
                
                cursor.execute("""
                    SELECT po.order_id, po.supplier_id, s.supplier_name, po.total_amount, po.status, po.order_date
                    FROM purchase_orders po
                    LEFT JOIN suppliers s ON po.supplier_id = s.supplier_id
                    LIMIT 3
                """)
                rows = cursor.fetchall()
                print(f"  Join query returned {len(rows)} rows:")
                for row in rows:
                    print(f"    {row}")
                    
        except Exception as e:
            print(f"  Raw SQL error: {e}")
            import traceback
            traceback.print_exc()
            
    except Exception as e:
        print(f"Setup error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_models()
