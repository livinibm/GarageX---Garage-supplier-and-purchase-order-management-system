from rest_framework import serializers
from .models import Supplier, SparePart, PurchaseOrder, PurchaseOrderItem, SupplierPayment, PurchaseInvoice, VendorScore
from decimal import Decimal

class SupplierSerializer(serializers.ModelSerializer):
    score = serializers.SerializerMethodField()
    on_time_rate = serializers.SerializerMethodField()
    avg_approval_hours = serializers.SerializerMethodField()
    dispute_rate = serializers.SerializerMethodField()
    completion_rate = serializers.SerializerMethodField()
    last_calculated_at = serializers.SerializerMethodField()

    class Meta:
        model = Supplier
        fields = [
            'supplier_id',
            'supplier_name',
            'contact_email',
            'phone_number',
            'address',
            'is_active',
            'score',
            'on_time_rate',
            'avg_approval_hours',
            'dispute_rate',
            'completion_rate',
            'last_calculated_at'
        ]

    def _get_vendor_score(self, obj):
        try:
            return obj.vendor_score
        except VendorScore.DoesNotExist:
            return None

    def get_score(self, obj):
        vendor_score = self._get_vendor_score(obj)
        return vendor_score.score if vendor_score else Decimal('0.00')

    def get_on_time_rate(self, obj):
        vendor_score = self._get_vendor_score(obj)
        return vendor_score.on_time_rate if vendor_score else Decimal('0.00')

    def get_avg_approval_hours(self, obj):
        vendor_score = self._get_vendor_score(obj)
        return vendor_score.avg_approval_hours if vendor_score else Decimal('0.00')

    def get_dispute_rate(self, obj):
        vendor_score = self._get_vendor_score(obj)
        return vendor_score.dispute_rate if vendor_score else Decimal('0.00')

    def get_completion_rate(self, obj):
        vendor_score = self._get_vendor_score(obj)
        return vendor_score.completion_rate if vendor_score else Decimal('0.00')

    def get_last_calculated_at(self, obj):
        vendor_score = self._get_vendor_score(obj)
        return vendor_score.last_calculated_at if vendor_score else None


class VendorScoreSerializer(serializers.ModelSerializer):
    supplier_name = serializers.ReadOnlyField(source='supplier.supplier_name')

    class Meta:
        model = VendorScore
        fields = [
            'score_id',
            'supplier',
            'supplier_name',
            'score',
            'on_time_rate',
            'avg_approval_hours',
            'dispute_rate',
            'completion_rate',
            'last_calculated_at'
        ]

class SparePartSerializer(serializers.ModelSerializer):
    
    supplier_name = serializers.ReadOnlyField(source='supplier.supplier_name')

    class Meta:
        model = SparePart
        fields = ['part_id', 'part_name', 'sku_code', 'unit_price', 'current_stock', 'supplier', 'supplier_name']

class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    part_name = serializers.ReadOnlyField(source='spare_part.part_name')

    class Meta:
        model = PurchaseOrderItem
        fields = ['item_id', 'spare_part', 'part_name', 'quantity', 'agreed_price']

class PurchaseOrderSerializer(serializers.ModelSerializer):
    items = PurchaseOrderItemSerializer(many=True)
    supplier_name = serializers.ReadOnlyField(source='supplier.supplier_name')
    created_by_user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = ['order_id', 'po_reference_number', 'supplier', 'supplier_name', 'status', 'approved_at', 'delivered_at', 'expected_delivery_date', 'order_date', 'total_amount', 'items', 'created_by_user']
        read_only_fields = ['order_id', 'order_date', 'total_amount']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        # If created_by_user is not provided, try to find a default or handle error
        # For now, if it's missing, let's assume we can't create it without a user, 
        # but in a real app we'd get it from request.user (mapping Django user to Legacy user)
        
        purchase_order = PurchaseOrder.objects.create(**validated_data)
        
        total = Decimal('0.00')
        for item_data in items_data:
            subtotal = Decimal(str(item_data['agreed_price'])) * Decimal(str(item_data['quantity']))
            total += subtotal
            PurchaseOrderItem.objects.create(purchase_order=purchase_order, **item_data)
        
        purchase_order.total_amount = total
        purchase_order.save()
        return purchase_order

class SupplierPaymentSerializer(serializers.ModelSerializer):
    supplier_name = serializers.ReadOnlyField(source='supplier.supplier_name')
    purchase_order_ref = serializers.ReadOnlyField(source='purchase_order.po_reference_number')

    class Meta:
        model = SupplierPayment
        fields = ['payment_id', 'supplier', 'supplier_name', 'purchase_order', 'purchase_order_ref', 'amount', 'payment_date', 'payment_method', 'reference_number', 'notes']
        read_only_fields = ['payment_id', 'payment_date']

class PurchaseInvoiceSerializer(serializers.ModelSerializer):
    purchase_order_ref = serializers.ReadOnlyField(source='purchase_order.po_reference_number')

    class Meta:
        model = PurchaseInvoice
        fields = ['invoice_id', 'purchase_order', 'purchase_order_ref', 'invoice_number', 'issue_date', 'due_date', 'total_amount', 'status', 'file']
        read_only_fields = ['invoice_id']
