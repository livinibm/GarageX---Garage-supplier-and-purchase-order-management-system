from django.urls import path
from .views import (
    ServiceListCreateView, ServiceDetailView,
    VehicleListCreateView, VehicleDetailView,
    ServiceRequestListCreateView, ServiceRequestDetailView,
    service_dashboard, vehicle_list
)

urlpatterns = [
    # API endpoints
    path('api/services/', ServiceListCreateView.as_view(), name='service-list-create'),
    path('api/services/<int:pk>/', ServiceDetailView.as_view(), name='service-detail'),
    path('api/vehicles/', VehicleListCreateView.as_view(), name='vehicle-list-create'),
    path('api/vehicles/<int:pk>/', VehicleDetailView.as_view(), name='vehicle-detail'),
    path('api/service-requests/', ServiceRequestListCreateView.as_view(), name='service-request-list-create'),
    path('api/service-requests/<int:pk>/', ServiceRequestDetailView.as_view(), name='service-request-detail'),
    
    # Template views (Traditional MVT)
    path('dashboard/', service_dashboard, name='service-dashboard'),
    path('vehicles/', vehicle_list, name='vehicle-list'),
]
