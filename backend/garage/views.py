from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import render, get_object_or_404
from .models import Service, Vehicle, ServiceRequest
from .serializers import ServiceSerializer, VehicleSerializer, ServiceRequestSerializer

# API Views (Controller Layer)
class ServiceListCreateView(generics.ListCreateAPIView):
    queryset = Service.objects.filter(is_active=True)
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]

class ServiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]

class VehicleListCreateView(generics.ListCreateAPIView):
    serializer_class = VehicleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Vehicle.objects.filter(owner=self.request.user)

class VehicleDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = VehicleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Vehicle.objects.filter(owner=self.request.user)

class ServiceRequestListCreateView(generics.ListCreateAPIView):
    serializer_class = ServiceRequestSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.profile.role == 'GARAGE':
            return ServiceRequest.objects.all()
        else:
            return ServiceRequest.objects.filter(vehicle__owner=user)

class ServiceRequestDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ServiceRequestSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.profile.role == 'GARAGE':
            return ServiceRequest.objects.all()
        else:
            return ServiceRequest.objects.filter(vehicle__owner=user)

# Template Views (Traditional Django MVT)
def service_dashboard(request):
    """Template view for service dashboard"""
    if not request.user.is_authenticated or request.user.profile.role != 'GARAGE':
        return render(request, 'garage/error.html', {'message': 'Access denied'})
    
    services = Service.objects.filter(is_active=True)
    service_requests = ServiceRequest.objects.all()
    
    context = {
        'services': services,
        'service_requests': service_requests,
    }
    return render(request, 'garage/dashboard.html', context)

def vehicle_list(request):
    """Template view for vehicle list"""
    if not request.user.is_authenticated:
        return render(request, 'garage/error.html', {'message': 'Please login'})
    
    vehicles = Vehicle.objects.filter(owner=request.user)
    context = {'vehicles': vehicles}
    return render(request, 'garage/vehicle_list.html', context)
