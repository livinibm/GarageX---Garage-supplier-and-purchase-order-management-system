import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from accounts.models import Profile
from supplier.models import Supplier

User = get_user_model()

# Create or get user
user, created = User.objects.get_or_create(
    username='supplier1',
    defaults={'email': 'supplier1@example.com'}
)

# Set password
user.set_password('supplier123')
user.save()

# Create or update profile
profile, _ = Profile.objects.get_or_create(user=user)
profile.role = 'SUPPLIER'
profile.phone = '555-0101'
profile.save()

# Create or get supplier
supplier, _ = Supplier.objects.get_or_create(
    user=user,
    defaults={
        'company_name': 'Supplier One Ltd',
        'contact_person': 'Jane Doe',
        'phone': '555-0101',
        'email': 'supplier1@example.com',
        'address': '456 Business Ave, NY'
    }
)

print("✅ User created successfully!")
print(f"Username: supplier1")
print(f"Password: supplier123")
print(f"Role: SUPPLIER")
print(f"Company: {supplier.company_name}")
