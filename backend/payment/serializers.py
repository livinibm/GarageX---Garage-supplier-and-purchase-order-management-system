"""
Serializers for Payment and Invoice models.
Handles data validation and transformation for API endpoints.
"""
from rest_framework import serializers
from .models import Payment, Invoice


class PaymentSerializer(serializers.ModelSerializer):
    """
    Serializer for Payment model.
    Validates payment data and provides formatted output for API responses.
    """
    
    supplier_name = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            'id',
            'supplier',
            'supplier_name',
            'amount',
            'date',
            'method',
            'status',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_supplier_name(self, obj):
        from supplier.models import Supplier
        # supplier field is CharField, might contain ID or Name
        val = str(obj.supplier).strip()
        
        # Try to get supplier by ID first
        if val.isdigit():
            try:
                supplier = Supplier.objects.get(id=int(val))
                return supplier.company_name
            except (Supplier.DoesNotExist, ValueError):
                pass
        
        # If supplier is already a name string, return it
        return val if val else 'Unknown'

    def validate_amount(self, value):
        """Ensure amount is positive"""
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value

    def validate(self, data):
        """Additional validation for payment data"""
        if not data.get('supplier'):
            raise serializers.ValidationError({"supplier": "Supplier name is required."})
        if not data.get('date'):
            raise serializers.ValidationError({"date": "Payment date is required."})
        return data


class InvoiceSerializer(serializers.ModelSerializer):
    """
    Serializer for Invoice model.
    Validates invoice data and includes computed fields.
    """
    is_overdue = serializers.ReadOnlyField()
    supplier_name = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = [
            'id',
            'supplier',
            'supplier_name',
            'order',
            'amount',
            'status',
            'due_date',
            'is_overdue',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'is_overdue', 'created_at', 'updated_at']

    def get_supplier_name(self, obj):
        from supplier.models import Supplier
        val = str(obj.supplier).strip()
        
        # Try to get supplier by ID first
        if val.isdigit():
            try:
                supplier = Supplier.objects.get(id=int(val))
                return supplier.company_name
            except (Supplier.DoesNotExist, ValueError):
                pass
        
        # If supplier is already a name string, return it
        return val if val else 'Unknown'

    def validate_amount(self, value):
        """Ensure amount is positive"""
        if value <= 0:
            raise serializers.ValidationError("Invoice amount must be greater than zero.")
        return value

    def validate(self, data):
        """Additional validation for invoice data"""
        if not data.get('supplier'):
            raise serializers.ValidationError({"supplier": "Supplier name or ID is required."})
        if not data.get('order'):
            raise serializers.ValidationError({"order": "Order ID is required."})
        if not data.get('due_date'):
            raise serializers.ValidationError({"due_date": "Due date is required."})
        return data
