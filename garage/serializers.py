from rest_framework import serializers
from .models import Service, Vehicle, ServiceRequest

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'

class VehicleSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    
    class Meta:
        model = Vehicle
        fields = '__all__'

class ServiceRequestSerializer(serializers.ModelSerializer):
    vehicle_info = VehicleSerializer(source='vehicle', read_only=True)
    service_info = ServiceSerializer(source='service', read_only=True)
    garage_staff_name = serializers.CharField(source='garage_staff.get_full_name', read_only=True)
    
    class Meta:
        model = ServiceRequest
        fields = '__all__'
