from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SupplierViewSet, SparePartViewSet, PurchaseOrderViewSet # Banuka Start: Added PurchaseOrderViewSet

router = DefaultRouter()
router.register(r'suppliers', SupplierViewSet)
router.register(r'parts', SparePartViewSet)
# Banuka Start
router.register(r'purchase-orders', PurchaseOrderViewSet)
# Banuka End

urlpatterns = [
    path('', include(router.urls)),
]