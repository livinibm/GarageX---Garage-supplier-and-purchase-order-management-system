from django.urls import path
from .views import AdminCreateUserView, AdminOnlyView, GarageOnlyView, SupplierOnlyView

urlpatterns = [
    path('create-user/', AdminCreateUserView.as_view(), name='create-user'),
    path('admin-only/', AdminOnlyView.as_view(), name='admin-only'),
    path('garage-only/', GarageOnlyView.as_view(), name='garage-only'),
    path('supplier-only/', SupplierOnlyView.as_view(), name='supplier-only'),
]
