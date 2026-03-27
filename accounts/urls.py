from django.urls import path
from .views import (
    AdminCreateUserView, AdminOnlyView, GarageOnlyView, SupplierOnlyView, 
    UserView, UsersView, AdminUserManagementView, AdminUserToggleView, 
    AdminPasswordResetView
)
from .activity_views import (
    AdminActivityLogsView, AdminFailedLoginsView, 
    AdminSuspiciousActivityView, AdminActivityStatsView
)

urlpatterns = [
    # Existing endpoints
    path('user/', UserView.as_view(), name='user'),
    path('users/', UsersView.as_view(), name='users'),
    path('create-user/', AdminCreateUserView.as_view(), name='create-user'),
    path('admin-only/', AdminOnlyView.as_view(), name='admin-only'),
    path('garage-only/', GarageOnlyView.as_view(), name='garage-only'),
    path('supplier-only/', SupplierOnlyView.as_view(), name='supplier-only'),
    
    # New admin user management endpoints
    path('admin/users/', AdminUserManagementView.as_view(), name='admin-user-management'),
    path('admin/users/<int:user_id>/toggle/', AdminUserToggleView.as_view(), name='admin-user-toggle'),
    path('admin/users/<int:user_id>/reset-password/', AdminPasswordResetView.as_view(), name='admin-reset-password'),
    
    # Admin activity logging endpoints
    path('admin/activity-logs/', AdminActivityLogsView.as_view(), name='admin-activity-logs'),
    path('admin/failed-logins/', AdminFailedLoginsView.as_view(), name='admin-failed-logins'),
    path('admin/suspicious-activity/', AdminSuspiciousActivityView.as_view(), name='admin-suspicious-activity'),
    path('admin/activity-stats/', AdminActivityStatsView.as_view(), name='admin-activity-stats'),
]
