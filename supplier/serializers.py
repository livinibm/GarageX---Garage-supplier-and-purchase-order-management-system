from rest_framework import serializers
from .models import Supplier, Part, PurchaseOrder, PurchaseOrderItem, PurchaseOrderApproval

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'

class PartSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='supplier.supplier_name', read_only=True)
    
    class Meta:
        model = Part
        fields = '__all__'

class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    part_info = PartSerializer(source='part', read_only=True)
    
    class Meta:
        model = PurchaseOrderItem
        fields = '__all__'

class PurchaseOrderSerializer(serializers.ModelSerializer):
    supplier_name = serializers.SerializerMethodField()
    
    class Meta:
        model = PurchaseOrder
        fields = [
            'order_id',
            'po_reference_number',
            'supplier_id',
            'supplier_name',
            'created_by_user_id',
            'order_date',
            'expected_delivery_date',
            'total_amount',
            'status',
            'approved_by',
            'approved_date',
            'rejection_reason',
        ]
    
    def get_supplier_name(self, obj):
        """Get supplier name"""
        try:
            supplier = Supplier.objects.get(supplier_id=obj.supplier_id)
            return supplier.supplier_name
        except Supplier.DoesNotExist:
            return None

class PurchaseOrderApprovalSerializer(serializers.ModelSerializer):
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    
    class Meta:
        model = PurchaseOrderApproval
        fields = '__all__'

class PurchaseOrderApproveRejectSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=['APPROVE', 'REJECT'])
    rejection_reason = serializers.CharField(required=False, allow_blank=True)
