from django.shortcuts import render, get_object_or_404
from .models import Supplier, Part, PurchaseOrder

# Template Views (Traditional Django MVT)
def supplier_dashboard(request):
    """Template view for supplier dashboard"""
    if not request.user.is_authenticated:
        return render(request, 'supplier/error.html', {'message': 'Please login'})
    
    if request.user.profile.role not in ['SUPPLIER', 'ADMIN']:
        return render(request, 'supplier/error.html', {'message': 'Access denied'})
    
    if request.user.profile.role == 'ADMIN':
        # Admin sees all suppliers and their data
        suppliers = Supplier.objects.filter(is_active=True)
        parts = Part.objects.filter(is_active=True)
        purchase_orders = PurchaseOrder.objects.all()
        context = {
            'admin_view': True,
            'suppliers': suppliers,
            'parts': parts,
            'purchase_orders': purchase_orders,
        }
    else:
        # Supplier sees only their own data
        supplier = get_object_or_404(Supplier, user=request.user)
        parts = Part.objects.filter(supplier=supplier, is_active=True)
        purchase_orders = PurchaseOrder.objects.filter(supplier=supplier)
        context = {
            'admin_view': False,
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
