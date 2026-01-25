"""
URL routing for Supplier API endpoints.
"""
from django.urls import path
from . import api_views

urlpatterns = [
    # Notification endpoints
    path('notifications/low-stock/', api_views.low_stock_notifications, name='low-stock-notifications'),
    path('notifications/pending-approvals/', api_views.pending_approvals_notifications, name='pending-approvals'),
    path('notifications/summary/', api_views.notifications_summary, name='notifications-summary'),
]
