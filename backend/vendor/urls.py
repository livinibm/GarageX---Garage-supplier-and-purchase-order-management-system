from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SupplierViewSet, SparePartViewSet, PurchaseOrderViewSet, SupplierPaymentViewSet, PurchaseInvoiceViewSet, ReportViewSet, VendorScoreViewSet

router = DefaultRouter()
router.register(r'suppliers', SupplierViewSet)
router.register(r'parts', SparePartViewSet)
router.register(r'purchase-orders', PurchaseOrderViewSet)
router.register(r'supplier-payments', SupplierPaymentViewSet)
router.register(r'purchase-invoices', PurchaseInvoiceViewSet)
router.register(r'vendor-scores', VendorScoreViewSet)
router.register(r'reports', ReportViewSet, basename='reports')

urlpatterns = [
    path('', include(router.urls)),
]
