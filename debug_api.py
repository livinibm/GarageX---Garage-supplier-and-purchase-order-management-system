#!/usr/bin/env python
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import RequestFactory
from django.contrib.auth.models import User
from supplier.views import PurchaseOrderViewSet
from supplier.models import PurchaseOrder
from rest_framework.test import APIRequestFactory

def debug_purchase_order_api():
    print("Debugging Purchase Order API...")
    
    # Create a request factory
    factory = APIRequestFactory()
    
    # Get or create a test user
    try:
        user = User.objects.get(username='admin1')
        print(f"Found user: {user.username}")
    except User.DoesNotExist:
        print("User admin1 not found")
        return
    
    # Create a view instance
    view = PurchaseOrderViewSet.as_view({'get': 'list'})
    
    # Create a request
    request = factory.get('/supplier/api/purchase-orders/')
    request.user = user
    
    try:
        # Call the view
        response = view(request)
        print(f"Response status: {response.status_code}")
        
        if hasattr(response, 'data'):
            print(f"Response data: {response.data}")
        else:
            print(f"Response content: {response.content}")
            
    except Exception as e:
        print(f"Error calling view: {e}")
        import traceback
        traceback.print_exc()
    
    # Check purchase orders directly
    try:
        orders = PurchaseOrder.objects.all()
        print(f"Direct query found {orders.count()} orders")
        
        for order in orders[:3]:
            print(f"  Order: {order.order_number}, Status: {order.status}")
            
    except Exception as e:
        print(f"Error querying orders: {e}")

if __name__ == '__main__':
    debug_purchase_order_api()
