from django.shortcuts import render, get_object_or_404
from .models import Service, Vehicle, ServiceRequest

# Template Views (Traditional Django MVT)
def service_dashboard(request):
    """Template view for service dashboard"""
    if not request.user.is_authenticated:
        return render(request, 'garage/error.html', {'message': 'Please login'})
    
    if request.user.profile.role not in ['GARAGE', 'ADMIN']:
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
