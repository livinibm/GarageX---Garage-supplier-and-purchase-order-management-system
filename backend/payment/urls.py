"""
URL routing for Payment and Invoice API endpoints.
Defines REST API routes using Django REST Framework routers.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PaymentViewSet, InvoiceViewSet
from . import report_views

# Create router and register viewsets
router = DefaultRouter()
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'invoices', InvoiceViewSet, basename='invoice')

urlpatterns = [
    path('', include(router.urls)),
    
    # Report endpoints
    path('reports/monthly-purchases/', report_views.monthly_purchase_report, name='monthly_purchase_report'),
    path('reports/suppliers/', report_views.supplier_report, name='supplier_report'),
    path('reports/stock/', report_views.stock_report, name='stock_report'),
    
    # Notification endpoints
    path('notifications/low-stock/', report_views.low_stock_alerts, name='low_stock_alerts'),
    path('notifications/pending-approvals/', report_views.pending_approval_alerts, name='pending_approval_alerts'),
    
    # Dashboard overview
    path('dashboard/overview/', report_views.dashboard_overview, name='dashboard_overview'),
    
    # Suppliers list for dropdowns
    path('suppliers/', report_views.suppliers_list, name='suppliers_list'),
]
