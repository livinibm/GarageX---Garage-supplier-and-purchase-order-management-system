#!/usr/bin/env python
import os
import django
import subprocess

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def fix_migrations():
    print("Checking and fixing migrations...")
    
    try:
        # Check if migrations are needed
        result = subprocess.run(['python', 'manage.py', 'makemigrations', '--dry-run'], 
                              capture_output=True, text=True, cwd='.')
        print(f"Makemigrations dry-run output: {result.stdout}")
        
        if "No changes detected" not in result.stdout:
            print("Migrations are needed. Creating migrations...")
            result = subprocess.run(['python', 'manage.py', 'makemigrations', 'supplier'], 
                                  capture_output=True, text=True, cwd='.')
            print(f"Makemigrations output: {result.stdout}")
            
            print("Applying migrations...")
            result = subprocess.run(['python', 'manage.py', 'migrate'], 
                                  capture_output=True, text=True, cwd='.')
            print(f"Migrate output: {result.stdout}")
        else:
            print("No migrations needed")
            
        # Test the model after migrations
        from supplier.models import PurchaseOrder
        orders = PurchaseOrder.objects.all()
        print(f"Successfully queried {orders.count()} purchase orders")
        
    except Exception as e:
        print(f"Error fixing migrations: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    fix_migrations()
