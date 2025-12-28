from django.urls import path
from .views import (
    SupplierListCreateView, SupplierDetailView,
    PartListCreateView, PartDetailView,
    PurchaseOrderListCreateView, PurchaseOrderDetailView,
    supplier_dashboard, part_catalog
)

urlpatterns = [
    # API endpoints
    path('api/suppliers/', SupplierListCreateView.as_view(), name='supplier-list-create'),
    path('api/suppliers/<int:pk>/', SupplierDetailView.as_view(), name='supplier-detail'),
    path('api/parts/', PartListCreateView.as_view(), name='part-list-create'),
    path('api/parts/<int:pk>/', PartDetailView.as_view(), name='part-detail'),
    path('api/purchase-orders/', PurchaseOrderListCreateView.as_view(), name='purchase-order-list-create'),
    path('api/purchase-orders/<int:pk>/', PurchaseOrderDetailView.as_view(), name='purchase-order-detail'),
    
    # Template views (Traditional MVT)
    path('dashboard/', supplier_dashboard, name='supplier-dashboard'),
    path('parts/', part_catalog, name='part-catalog'),
]
