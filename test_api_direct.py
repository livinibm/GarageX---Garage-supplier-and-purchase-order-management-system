#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def test_api_direct():
    print("=== DIRECT API TEST ===")
    
    try:
        from supplier.views import PurchaseOrderViewSet
        from supplier.serializers import PurchaseOrderSerializer
        from supplier.models import PurchaseOrder
        from django.test import APIRequestFactory
        from django.contrib.auth.models import User
        
        # Create a mock request
        factory = APIRequestFactory()
        request = factory.get('/supplier/api/purchase-orders/')
        
        # Get a user for authentication
        try:
            user = User.objects.first()
            if not user:
                print("No users found in database")
                return
            request.user = user
            print(f"Using user: {user.username}")
        except Exception as e:
            print(f"Error getting user: {e}")
            return
        
        # Test the viewset directly
        print("\n1. VIEWSET LIST TEST:")
        viewset = PurchaseOrderViewSet()
        viewset.request = request
        viewset.format_kwarg = None
        
        try:
            queryset = viewset.get_queryset()
            print(f"  ViewSet queryset count: {queryset.count()}")
            
            serializer = viewset.get_serializer(queryset, many=True)
            print(f"  Serialized data length: {len(serializer.data)}")
            
            if serializer.data:
                print(f"  First order data: {serializer.data[0]}")
            else:
                print("  No serialized data")
                
        except Exception as e:
            print(f"  ViewSet error: {e}")
            import traceback
            traceback.print_exc()
        
        # Test serializer directly
        print("\n2. SERIALIZER DIRECT TEST:")
        try:
            orders = PurchaseOrder.objects.all()[:1]
            if orders:
                serializer = PurchaseOrderSerializer(orders[0])
                print(f"  Direct serializer data: {serializer.data}")
            else:
                print("  No orders to serialize")
        except Exception as e:
            print(f"  Direct serializer error: {e}")
            import traceback
            traceback.print_exc()
            
    except Exception as e:
        print(f"Setup error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_api_direct()
