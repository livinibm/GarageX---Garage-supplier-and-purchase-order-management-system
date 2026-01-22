#!/usr/bin/env python
import os
import django
import subprocess

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection

def fix_database_fields():
    """Fix database field names to match Django model"""
    
    print("Checking current database structure...")
    
    with connection.cursor() as cursor:
        # Check current table structure
        cursor.execute("DESCRIBE supplier_purchaseorder")
        columns = cursor.fetchall()
        
        print("Current columns:")
        for col in columns:
            print(f"  {col[0]} - {col[1]}")
        
        # Check if we need to fix field names
        current_columns = [col[0] for col in columns]
        
        # Map old field names to new field names
        field_mappings = {
            'po_reference_number': 'order_number',
            'created_by_user_id': 'ordered_by_id',
            'order_id': 'id'  # This should already be correct
        }
        
        # Generate ALTER TABLE statements
        for old_name, new_name in field_mappings.items():
            if old_name in current_columns and new_name not in current_columns:
                try:
                    sql = f"ALTER TABLE supplier_purchaseorder CHANGE COLUMN {old_name} {new_name} VARCHAR(50)"
                    if old_name == 'created_by_user_id':
                        sql = f"ALTER TABLE supplier_purchaseorder CHANGE COLUMN {old_name} {new_name} INT"
                    
                    print(f"Executing: {sql}")
                    cursor.execute(sql)
                    print(f"Successfully renamed {old_name} to {new_name}")
                    
                except Exception as e:
                    print(f"Error renaming {old_name} to {new_name}: {e}")
        
        # Check if status needs to be updated from 'Pending' to 'PENDING'
        cursor.execute("SELECT DISTINCT status FROM supplier_purchaseorder")
        statuses = [row[0] for row in cursor.fetchall()]
        print(f"Current statuses: {statuses}")
        
        if 'Pending' in statuses:
            cursor.execute("UPDATE supplier_purchaseorder SET status = 'PENDING' WHERE status = 'Pending'")
            print("Updated status from 'Pending' to 'PENDING'")
        
        # Verify the changes
        cursor.execute("DESCRIBE supplier_purchaseorder")
        new_columns = cursor.fetchall()
        print("\nUpdated columns:")
        for col in new_columns:
            print(f"  {col[0]} - {col[1]}")
        
        # Show sample data
        cursor.execute("SELECT * FROM supplier_purchaseorder LIMIT 3")
        rows = cursor.fetchall()
        print(f"\nSample data ({len(rows)} rows):")
        for row in rows:
            print(f"  {row}")

if __name__ == '__main__':
    fix_database_fields()
