from django.shortcuts import get_object_or_404
from ..models import Supplier, Part, PurchaseOrder, PurchaseOrderItem
from ..serializers import SupplierSerializer, PartSerializer, PurchaseOrderSerializer, PurchaseOrderItemSerializer

def get_all_suppliers():
    """Get all active suppliers"""
    return Supplier.objects.filter(is_active=True)

def get_supplier_by_id(supplier_id):
    """Get supplier by ID"""
    try:
        return Supplier.objects.get(id=supplier_id)
    except Supplier.DoesNotExist:
        return None

def create_supplier(supplier_data, user):
    """Create new supplier (admin only)"""
    if user.profile.role != 'ADMIN':
        return None
    
    serializer = SupplierSerializer(data=supplier_data)
    if serializer.is_valid():
        return serializer.save()
    return None

def update_supplier(supplier_id, supplier_data, user):
    """Update supplier (admin or supplier only)"""
    try:
        if user.profile.role == 'ADMIN':
            supplier = Supplier.objects.get(id=supplier_id)
        elif user.profile.role == 'SUPPLIER':
            supplier = Supplier.objects.get(id=supplier_id, user=user)
        else:
            return None
        
        serializer = SupplierSerializer(supplier, data=supplier_data, partial=True)
        if serializer.is_valid():
            return serializer.save()
        return None
    except Supplier.DoesNotExist:
        return None

def get_all_parts():
    """Get all active parts"""
    return Part.objects.filter(is_active=True)

def get_part_by_id(part_id):
    """Get part by ID"""
    try:
        return Part.objects.get(id=part_id)
    except Part.DoesNotExist:
        return None

def create_part(part_data, user):
    """Create new part (admin or supplier only)"""
    if user.profile.role not in ['ADMIN', 'SUPPLIER']:
        return None
    
    # If supplier, set the supplier field
    if user.profile.role == 'SUPPLIER':
        try:
            supplier = Supplier.objects.get(user=user)
            part_data['supplier'] = supplier.id
        except Supplier.DoesNotExist:
            return None
    
    serializer = PartSerializer(data=part_data)
    if serializer.is_valid():
        return serializer.save()
    return None

def update_part(part_id, part_data, user):
    """Update part (admin or supplier only)"""
    try:
        if user.profile.role == 'ADMIN':
            part = Part.objects.get(id=part_id)
        elif user.profile.role == 'SUPPLIER':
            part = Part.objects.get(id=part_id, supplier__user=user)
        else:
            return None
        
        serializer = PartSerializer(part, data=part_data, partial=True)
        if serializer.is_valid():
            return serializer.save()
        return None
    except Part.DoesNotExist:
        return None

def delete_part(part_id, user):
    """Delete part (admin or supplier only)"""
    try:
        if user.profile.role == 'ADMIN':
            part = Part.objects.get(id=part_id)
        elif user.profile.role == 'SUPPLIER':
            part = Part.objects.get(id=part_id, supplier__user=user)
        else:
            return False
        
        part.is_active = False
        part.save()
        return True
    except Part.DoesNotExist:
        return False

def get_supplier_parts(user):
    """Get parts for current supplier"""
    if user.profile.role != 'SUPPLIER':
        return []
    
    try:
        supplier = Supplier.objects.get(user=user)
        return Part.objects.filter(supplier=supplier, is_active=True)
    except Supplier.DoesNotExist:
        return []

def get_purchase_orders(user):
    """Get purchase orders for current user"""
    if user.profile.role == 'ADMIN':
        return PurchaseOrder.objects.all()
    elif user.profile.role == 'SUPPLIER':
        try:
            supplier = Supplier.objects.get(user=user)
            return PurchaseOrder.objects.filter(supplier=supplier)
        except Supplier.DoesNotExist:
            return []
    else:
        return []

def get_purchase_order_by_id(order_id, user):
    """Get purchase order by ID with permission check"""
    try:
        if user.profile.role == 'ADMIN':
            return PurchaseOrder.objects.get(id=order_id)
        elif user.profile.role == 'SUPPLIER':
            supplier = Supplier.objects.get(user=user)
            return PurchaseOrder.objects.get(id=order_id, supplier=supplier)
        else:
            return None
    except (PurchaseOrder.DoesNotExist, Supplier.DoesNotExist):
        return None

def create_purchase_order(order_data, user):
    """Create new purchase order (admin or supplier only)"""
    if user.profile.role not in ['ADMIN', 'SUPPLIER']:
        return None
    
    # If supplier, set the supplier field
    if user.profile.role == 'SUPPLIER':
        try:
            supplier = Supplier.objects.get(user=user)
            order_data['supplier'] = supplier.id
        except Supplier.DoesNotExist:
            return None
    
    serializer = PurchaseOrderSerializer(data=order_data)
    if serializer.is_valid():
        return serializer.save()
    return None

def update_purchase_order(order_id, order_data, user):
    """Update purchase order (admin or supplier only)"""
    try:
        if user.profile.role == 'ADMIN':
            order = PurchaseOrder.objects.get(id=order_id)
        elif user.profile.role == 'SUPPLIER':
            supplier = Supplier.objects.get(user=user)
            order = PurchaseOrder.objects.get(id=order_id, supplier=supplier)
        else:
            return None
        
        serializer = PurchaseOrderSerializer(order, data=order_data, partial=True)
        if serializer.is_valid():
            return serializer.save()
        return None
    except (PurchaseOrder.DoesNotExist, Supplier.DoesNotExist):
        return None
