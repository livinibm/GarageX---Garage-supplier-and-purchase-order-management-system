#!/usr/bin/env python
import os
import django
import requests

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def test_api_endpoints():
    base_url = "http://127.0.0.1:8000"
    
    print("Testing API endpoints...")
    
    # Test token endpoint
    try:
        response = requests.post(f"{base_url}/api/token/", json={
            "username": "admin1",
            "password": "admin123"
        })
        print(f"Token endpoint status: {response.status_code}")
        if response.status_code == 200:
            token_data = response.json()
            print(f"Got token: {bool(token_data.get('access'))}")
            
            # Test purchase orders endpoint
            headers = {"Authorization": f"Bearer {token_data['access']}"}
            po_response = requests.get(f"{base_url}/supplier/api/purchase-orders/", headers=headers)
            print(f"Purchase orders endpoint status: {po_response.status_code}")
            print(f"Response data: {po_response.text[:200]}...")
        else:
            print(f"Token error: {response.text}")
    except Exception as e:
        print(f"API test error: {e}")

if __name__ == '__main__':
    test_api_endpoints()
