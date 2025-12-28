from rest_framework import serializers
from .models import Supplier, Part, PurchaseOrder, PurchaseOrderItem

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'

class PartSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='supplier.company_name', read_only=True)
    
    class Meta:
        model = Part
        fields = '__all__'

class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    part_info = PartSerializer(source='part', read_only=True)
    
    class Meta:
        model = PurchaseOrderItem
        fields = '__all__'

class PurchaseOrderSerializer(serializers.ModelSerializer):
    items = PurchaseOrderItemSerializer(many=True, read_only=True)
    supplier_info = SupplierSerializer(source='supplier', read_only=True)
    ordered_by_name = serializers.CharField(source='ordered_by.get_full_name', read_only=True)
    
    class Meta:
        model = PurchaseOrder
        fields = '__all__'
