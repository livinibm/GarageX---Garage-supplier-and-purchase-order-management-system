#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.urls import reverse
from django.test import Client

def test_urls():
    print("Testing URLs...")
    
    try:
        # Test if the URL resolves
        url = reverse('purchaseorder-list')
        print(f"Purchase order list URL: {url}")
        
        # Test client access
        client = Client()
        
        # Try without authentication
        response = client.get(url)
        print(f"Unauthenticated response: {response.status_code}")
        
        # Try with authentication (if we have a user)
        from django.contrib.auth.models import User
        try:
            user = User.objects.get(username='admin1')
            client.force_login(user)
            response = client.get(url)
            print(f"Authenticated response: {response.status_code}")
            print(f"Response content: {response.content[:200]}...")
        except User.DoesNotExist:
            print("No admin1 user found")
            
    except Exception as e:
        print(f"URL test error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_urls()
