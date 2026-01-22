#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def simple_test():
    try:
        from supplier.models import PurchaseOrder
        from django.db import connection
        
        print("Testing PurchaseOrder model...")
        
        # Check if the model has the new fields
        try:
            # Try to access new fields
            order = PurchaseOrder()
            print("Model fields:")
            for field in PurchaseOrder._meta.get_fields():
                print(f"  {field.name} - {field.__class__.__name__}")
            
            # Check database table structure
            with connection.cursor() as cursor:
                cursor.execute("DESCRIBE supplier_purchaseorder")
                columns = cursor.fetchall()
                print("\nDatabase columns:")
                for col in columns:
                    print(f"  {col[0]}")
                    
        except Exception as e:
            print(f"Error checking model: {e}")
            
        # Try to create a simple query
        try:
            count = PurchaseOrder.objects.count()
            print(f"\nPurchase order count: {count}")
        except Exception as e:
            print(f"Error querying purchase orders: {e}")
            
    except Exception as e:
        print(f"Setup error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    simple_test()
