#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def test_backend():
    print("Testing backend purchase order fetching...")
    
    try:
        from supplier.models import PurchaseOrder, Supplier
        from supplier.serializers import PurchaseOrderSerializer
        from django.contrib.auth.models import User
        
        # Check if we have data
        orders = PurchaseOrder.objects.all()
        print(f"Total purchase orders in DB: {orders.count()}")
        
        suppliers = Supplier.objects.all()
        print(f"Total suppliers in DB: {suppliers.count()}")
        
        users = User.objects.all()
        print(f"Total users in DB: {users.count()}")
        
        # Show sample orders
        for order in orders[:3]:
            print(f"\nOrder: {order.order_number}")
            print(f"  Status: {order.status}")
            print(f"  Supplier: {order.supplier.company_name if order.supplier else 'None'}")
            print(f"  Total: ${order.total_amount}")
            print(f"  Date: {order.order_date}")
        
        # Test serializer
        if orders.exists():
            serializer = PurchaseOrderSerializer(orders, many=True)
            print(f"\nSerialized data sample:")
            print(f"First order: {serializer.data[0] if serializer.data else 'None'}")
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_backend()
