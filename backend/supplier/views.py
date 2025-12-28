from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import render, get_object_or_404
from .models import Supplier, Part, PurchaseOrder, PurchaseOrderItem
from .serializers import SupplierSerializer, PartSerializer, PurchaseOrderSerializer, PurchaseOrderItemSerializer

# API Views (Controller Layer)
class SupplierListCreateView(generics.ListCreateAPIView):
    queryset = Supplier.objects.filter(is_active=True)
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticated]

class SupplierDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticated]

class PartListCreateView(generics.ListCreateAPIView):
    serializer_class = PartSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Part.objects.filter(is_active=True)

class PartDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Part.objects.all()
    serializer_class = PartSerializer
    permission_classes = [IsAuthenticated]

class PurchaseOrderListCreateView(generics.ListCreateAPIView):
    serializer_class = PurchaseOrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.profile.role == 'SUPPLIER':
            return PurchaseOrder.objects.filter(supplier__user=user)
        else:
            return PurchaseOrder.objects.all()

class PurchaseOrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PurchaseOrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.profile.role == 'SUPPLIER':
            return PurchaseOrder.objects.filter(supplier__user=user)
        else:
            return PurchaseOrder.objects.all()

# Template Views (Traditional Django MVT)
def supplier_dashboard(request):
    """Template view for supplier dashboard"""
    if not request.user.is_authenticated or request.user.profile.role != 'SUPPLIER':
        return render(request, 'supplier/error.html', {'message': 'Access denied'})
    
    supplier = get_object_or_404(Supplier, user=request.user)
    parts = Part.objects.filter(supplier=supplier, is_active=True)
    purchase_orders = PurchaseOrder.objects.filter(supplier=supplier)
    
    context = {
        'supplier': supplier,
        'parts': parts,
        'purchase_orders': purchase_orders,
    }
    return render(request, 'supplier/dashboard.html', context)

def part_catalog(request):
    """Template view for parts catalog"""
    if not request.user.is_authenticated:
        return render(request, 'supplier/error.html', {'message': 'Please login'})
    
    parts = Part.objects.filter(is_active=True)
    context = {'parts': parts}
    return render(request, 'supplier/part_catalog.html', context)
