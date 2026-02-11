from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Supplier, Part, PurchaseOrder, PurchaseOrderItem


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']


class SupplierSerializer(serializers.ModelSerializer):
    
    user_details = UserSerializer(source='user', read_only=True)

    class Meta:
        model = Supplier
        fields = [
            'id', 'user', 'user_details', 'company_name', 
            'contact_person', 'phone', 'email', 'address', 'is_active'
        ]


class PartSerializer(serializers.ModelSerializer):
    
    supplier_name = serializers.ReadOnlyField(source='supplier.company_name')

    class Meta:
        model = Part
        fields = [
            'id', 'name', 'part_number', 'description', 'part_type', 
            'price', 'stock_quantity', 'min_stock_level', 'supplier', 
            'supplier_name', 'is_active'
        ]
