from django.urls import path

from .views import PurchaseOrderViewSet


purchase_order_approve = PurchaseOrderViewSet.as_view({'post': 'approve'})
purchase_order_reject = PurchaseOrderViewSet.as_view({'post': 'reject'})
purchase_order_delivered = PurchaseOrderViewSet.as_view({'post': 'delivered'})


urlpatterns = [
    path('purchase-orders/<int:pk>/approve', purchase_order_approve, name='purchase-order-approve'),
    path('purchase-orders/<int:pk>/approve/', purchase_order_approve, name='purchase-order-approve-slash'),
    path('purchase-orders/<int:pk>/reject', purchase_order_reject, name='purchase-order-reject'),
    path('purchase-orders/<int:pk>/reject/', purchase_order_reject, name='purchase-order-reject-slash'),
    path('purchase-orders/<int:pk>/delivered', purchase_order_delivered, name='purchase-order-delivered'),
    path('purchase-orders/<int:pk>/delivered/', purchase_order_delivered, name='purchase-order-delivered-slash'),
]
