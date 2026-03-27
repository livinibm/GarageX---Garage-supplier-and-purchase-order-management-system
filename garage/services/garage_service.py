from django.shortcuts import get_object_or_404
from ..models import Service, Vehicle, ServiceRequest
from ..serializers import ServiceSerializer, VehicleSerializer, ServiceRequestSerializer

def get_all_services():
    """Get all active services"""
    return Service.objects.filter(is_active=True)

def get_service_by_id(service_id):
    """Get service by ID"""
    try:
        return Service.objects.get(id=service_id)
    except Service.DoesNotExist:
        return None

def create_service(service_data, user):
    """Create new service (Garage staff or admin only)"""
    if user.profile.role not in ['GARAGE', 'ADMIN']:
        return None
    
    serializer = ServiceSerializer(data=service_data)
    if serializer.is_valid():
        return serializer.save()
    return None

def update_service(service_id, service_data, user):
    """Update service (Garage staff or admin only)"""
    if user.profile.role not in ['GARAGE', 'ADMIN']:
        return None
    
    try:
        service = Service.objects.get(id=service_id)
        serializer = ServiceSerializer(service, data=service_data, partial=True)
        if serializer.is_valid():
            return serializer.save()
        return None
    except Service.DoesNotExist:
        return None

def delete_service(service_id, user):
    """Delete service (Garage staff or admin only)"""
    if user.profile.role not in ['GARAGE', 'ADMIN']:
        return False
    
    try:
        service = Service.objects.get(id=service_id)
        service.is_active = False
        service.save()
        return True
    except Service.DoesNotExist:
        return False

def get_user_vehicles(user):
    """Get vehicles for current user"""
    if user.profile.role == 'GARAGE':
        return Vehicle.objects.all()
    else:
        return Vehicle.objects.filter(owner=user)

def get_vehicle_by_id(vehicle_id, user):
    """Get vehicle by ID with permission check"""
    try:
        if user.profile.role == 'GARAGE':
            return Vehicle.objects.get(id=vehicle_id)
        else:
            return Vehicle.objects.get(id=vehicle_id, owner=user)
    except Vehicle.DoesNotExist:
        return None

def create_vehicle(vehicle_data, user):
    """Create new vehicle"""
    serializer = VehicleSerializer(data={**vehicle_data, 'owner': user.id})
    if serializer.is_valid():
        return serializer.save()
    return None

def update_vehicle(vehicle_id, vehicle_data, user):
    """Update vehicle"""
    try:
        if user.profile.role == 'GARAGE':
            vehicle = Vehicle.objects.get(id=vehicle_id)
        else:
            vehicle = Vehicle.objects.get(id=vehicle_id, owner=user)
        
        serializer = VehicleSerializer(vehicle, data=vehicle_data, partial=True)
        if serializer.is_valid():
            return serializer.save()
        return None
    except Vehicle.DoesNotExist:
        return None

def get_service_requests(user):
    """Get service requests for current user"""
    if user.profile.role == 'GARAGE':
        return ServiceRequest.objects.all()
    else:
        return ServiceRequest.objects.filter(vehicle__owner=user)

def create_service_request(request_data, user):
    """Create new service request"""
    serializer = ServiceRequestSerializer(data=request_data)
    if serializer.is_valid():
        return serializer.save()
    return None

def update_service_request(request_id, request_data, user):
    """Update service request (Garage staff only)"""
    if user.profile.role != 'GARAGE':
        return None
    
    try:
        service_request = ServiceRequest.objects.get(id=request_id)
        serializer = ServiceRequestSerializer(service_request, data=request_data, partial=True)
        if serializer.is_valid():
            return serializer.save()
        return None
    except ServiceRequest.DoesNotExist:
        return None
