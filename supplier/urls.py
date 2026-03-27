from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    supplier_dashboard, part_catalog, 
    PurchaseOrderViewSet, PurchaseOrderApprovalViewSet, PartViewSet
)
from .services.supplier_service import (
    get_all_suppliers, get_supplier_by_id, create_supplier, update_supplier,
    get_all_parts, get_part_by_id, create_part, update_part, delete_part,
    get_purchase_orders, get_purchase_order_by_id, create_purchase_order, update_purchase_order,
    get_supplier_parts
)
from utils.http_responses import success_response, error_response, not_found_response, created_response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from utils.permissions import IsAdmin, IsSupplier, IsAdminOrSupplier

# Create router for ViewSets
router = DefaultRouter()
router.register(r'api/parts', PartViewSet)
router.register(r'api/purchase-orders', PurchaseOrderViewSet)
router.register(r'api/purchase-order-approvals', PurchaseOrderApprovalViewSet)

# Supplier endpoints
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_suppliers(request):
    suppliers = get_all_suppliers()
    return success_response(suppliers, "Suppliers retrieved successfully")

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_supplier(request, supplier_id):
    supplier = get_supplier_by_id(supplier_id)
    if supplier is None:
        return not_found_response("Supplier not found")
    return success_response(supplier, "Supplier retrieved successfully")

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def create_supplier(request):
    supplier = create_supplier(request.data, request.user)
    if supplier:
        return created_response(supplier, "Supplier created successfully")
    return error_response("Failed to create supplier")

@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsAdminOrSupplier])
def update_supplier(request, supplier_id):
    supplier = update_supplier(supplier_id, request.data, request.user)
    if supplier is None:
        return not_found_response("Supplier not found")
    return success_response(supplier, "Supplier updated successfully")

# Part endpoints
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_parts(request):
    parts = get_all_parts()
    return success_response(parts, "Parts retrieved successfully")

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_part(request, part_id):
    part = get_part_by_id(part_id)
    if part is None:
        return not_found_response("Part not found")
    return success_response(part, "Part retrieved successfully")

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminOrSupplier])
def create_part(request):
    part = create_part(request.data, request.user)
    if part:
        return created_response(part, "Part created successfully")
    return error_response("Failed to create part")

@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsAdminOrSupplier])
def update_part(request, part_id):
    part = update_part(part_id, request.data, request.user)
    if part is None:
        return not_found_response("Part not found")
    return success_response(part, "Part updated successfully")

@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdminOrSupplier])
def delete_part(request, part_id):
    success = delete_part(part_id, request.user)
    if not success:
        return not_found_response("Part not found")
    return success_response(None, "Part deleted successfully")

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsSupplier])
def list_my_parts(request):
    parts = get_supplier_parts(request.user)
    return success_response(parts, "My parts retrieved successfully")

# Purchase order endpoints
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_purchase_orders(request):
    orders = get_purchase_orders(request.user)
    return success_response(orders, "Purchase orders retrieved successfully")

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_purchase_order(request, order_id):
    order = get_purchase_order_by_id(order_id, request.user)
    if order is None:
        return not_found_response("Purchase order not found")
    return success_response(order, "Purchase order retrieved successfully")

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminOrSupplier])
def create_purchase_order(request):
    order = create_purchase_order(request.data, request.user)
    if order:
        return created_response(order, "Purchase order created successfully")
    return error_response("Failed to create purchase order")

@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsAdminOrSupplier])
def update_purchase_order(request, order_id):
    order = update_purchase_order(order_id, request.data, request.user)
    if order is None:
        return not_found_response("Purchase order not found")
    return success_response(order, "Purchase order updated successfully")

urlpatterns = [
    # ViewSet URLs
    path('', include(router.urls)),
    
    # API endpoints
    path('suppliers/', list_suppliers, name='supplier-list'),
    path('suppliers/<int:supplier_id>/', get_supplier, name='supplier-detail'),
    path('suppliers/create/', create_supplier, name='supplier-create'),
    path('suppliers/<int:supplier_id>/update/', update_supplier, name='supplier-update'),
    
    path('parts/', list_parts, name='part-list'),
    path('parts/<int:part_id>/', get_part, name='part-detail'),
    path('parts/create/', create_part, name='part-create'),
    path('parts/<int:part_id>/update/', update_part, name='part-update'),
    path('parts/<int:part_id>/delete/', delete_part, name='part-delete'),
    path('parts/my-parts/', list_my_parts, name='my-parts'),
    
    path('purchase-orders/', list_purchase_orders, name='purchase-order-list'),
    path('purchase-orders/<int:order_id>/', get_purchase_order, name='purchase-order-detail'),
    path('purchase-orders/create/', create_purchase_order, name='purchase-order-create'),
    path('purchase-orders/<int:order_id>/update/', update_purchase_order, name='purchase-order-update'),
    
    # Template views (Traditional MVT)
    path('dashboard/', supplier_dashboard, name='supplier-dashboard'),
    path('parts/catalog/', part_catalog, name='part-catalog'),
]
