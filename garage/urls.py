from django.urls import path
from .views import service_dashboard, vehicle_list
from .services.garage_service import (
    get_all_services, get_service_by_id, create_service, update_service, delete_service,
    get_user_vehicles, get_vehicle_by_id, create_vehicle, update_vehicle,
    get_service_requests, create_service_request, update_service_request
)
from utils.http_responses import success_response, error_response, not_found_response, created_response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from utils.permissions import IsGarageStaff, IsOwnerOrReadOnly

# Service endpoints
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_services(request):
    services = get_all_services()
    return success_response(services, "Services retrieved successfully")

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_service(request, service_id):
    service = get_service_by_id(service_id)
    if service is None:
        return not_found_response("Service not found")
    return success_response(service, "Service retrieved successfully")

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsGarageStaff])
def create_service(request):
    service = create_service(request.data, request.user)
    if service:
        return created_response(service, "Service created successfully")
    return error_response("Failed to create service")

@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsGarageStaff])
def update_service(request, service_id):
    service = update_service(service_id, request.data, request.user)
    if service is None:
        return not_found_response("Service not found")
    return success_response(service, "Service updated successfully")

@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsGarageStaff])
def delete_service(request, service_id):
    success = delete_service(service_id, request.user)
    if not success:
        return not_found_response("Service not found")
    return success_response(None, "Service deleted successfully")

# Vehicle endpoints
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_vehicles(request):
    vehicles = get_user_vehicles(request.user)
    return success_response(vehicles, "Vehicles retrieved successfully")

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_vehicle(request, vehicle_id):
    vehicle = get_vehicle_by_id(vehicle_id, request.user)
    if vehicle is None:
        return not_found_response("Vehicle not found")
    return success_response(vehicle, "Vehicle retrieved successfully")

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_vehicle(request):
    vehicle = create_vehicle(request.data, request.user)
    if vehicle:
        return created_response(vehicle, "Vehicle created successfully")
    return error_response("Failed to create vehicle")

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_vehicle(request, vehicle_id):
    vehicle = update_vehicle(vehicle_id, request.data, request.user)
    if vehicle is None:
        return not_found_response("Vehicle not found")
    return success_response(vehicle, "Vehicle updated successfully")

# Service request endpoints
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_service_requests(request):
    requests = get_service_requests(request.user)
    return success_response(requests, "Service requests retrieved successfully")

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_service_request(request):
    service_request = create_service_request(request.data, request.user)
    if service_request:
        return created_response(service_request, "Service request created successfully")
    return error_response("Failed to create service request")

@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsGarageStaff])
def update_service_request(request, request_id):
    service_request = update_service_request(request_id, request.data, request.user)
    if service_request is None:
        return not_found_response("Service request not found")
    return success_response(service_request, "Service request updated successfully")

urlpatterns = [
    # API endpoints
    path('services/', list_services, name='service-list'),
    path('services/<int:service_id>/', get_service, name='service-detail'),
    path('services/create/', create_service, name='service-create'),
    path('services/<int:service_id>/update/', update_service, name='service-update'),
    path('services/<int:service_id>/delete/', delete_service, name='service-delete'),
    
    path('vehicles/', list_vehicles, name='vehicle-list'),
    path('vehicles/<int:vehicle_id>/', get_vehicle, name='vehicle-detail'),
    path('vehicles/create/', create_vehicle, name='vehicle-create'),
    path('vehicles/<int:vehicle_id>/update/', update_vehicle, name='vehicle-update'),
    
    path('service-requests/', list_service_requests, name='service-request-list'),
    path('service-requests/create/', create_service_request, name='service-request-create'),
    path('service-requests/<int:request_id>/update/', update_service_request, name='service-request-update'),
    
    # Template views (Traditional MVT)
    path('dashboard/', service_dashboard, name='service-dashboard'),
    path('vehicles/list/', vehicle_list, name='vehicle-list'),
]
