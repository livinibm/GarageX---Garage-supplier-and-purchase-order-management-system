"""
API views for reports and notifications.
Provides endpoints for analytics, reports, and alert systems.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import models
from django.db.models import Sum, Count, F
from .services.payment_service import PaymentService, InvoiceService


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def monthly_purchase_report(request):
    """
    Get monthly purchase report.
    Query params: year (optional), month (optional)
    """
    year = request.query_params.get('year', None)
    month = request.query_params.get('month', None)
    
    if year:
        year = int(year)
    if month:
        month = int(month)
    
    report_data = PaymentService.get_monthly_purchase_report(year=year, month=month)
    
    return Response({
        'status': 'success',
        'data': report_data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def supplier_report(request):
    """
    Get supplier payment summary report.
    Shows total payments and amounts for each supplier.
    """
    supplier_filter = request.query_params.get('supplier', None)
    
    supplier_data = PaymentService.get_supplier_summary()
    
    if supplier_filter:
        supplier_data = [s for s in supplier_data if s['supplier'] == supplier_filter]
    
    return Response({
        'status': 'success',
        'data': supplier_data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stock_report(request):
    """
    Get stock level report.
    Shows parts with low stock levels using the existing Part model.
    """
    try:
        # Use existing Part model from supplier app
        from supplier.models import Part
        
        threshold = request.query_params.get('threshold', 10)
        threshold = int(threshold)
        
        # Get parts below threshold or min_stock_level
        low_stock = Part.objects.filter(
            stock_quantity__lte=threshold,
            is_active=True
        ).values('id', 'name', 'part_number', 'stock_quantity', 'min_stock_level', 'supplier__company_name')
        
        stock_data = [
            {
                'id': item['id'],
                'product': item['name'],
                'part_number': item['part_number'],
                'stock': item['stock_quantity'],
                'reorder_level': item['min_stock_level'],
                'supplier': item['supplier__company_name']
            }
            for item in low_stock
        ]
        
        return Response({
            'status': 'success',
            'data': stock_data
        })
    
    except Exception as e:
        # Return error if Part model access fails
        return Response({
            'status': 'error',
            'message': str(e),
            'data': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def low_stock_alerts(request):
    """
    Get low stock alerts for notifications.
    Returns parts that need reordering using existing Part model.
    """
    try:
        from supplier.models import Part
        
        # Get parts where stock is at or below minimum stock level
        low_stock_parts = Part.objects.filter(
            stock_quantity__lte=models.F('min_stock_level'),
            is_active=True
        ).select_related('supplier').values(
            'id', 'name', 'part_number', 'stock_quantity', 'min_stock_level', 'supplier__company_name'
        )[:10]  # Limit to 10 alerts
        
        alerts = [
            {
                'id': item['id'],
                'message': f"{item['name']} ({item['part_number']}) is low in stock",
                'product': item['name'],
                'part_number': item['part_number'],
                'stock': item['stock_quantity'],
                'min_level': item['min_stock_level'],
                'supplier': item['supplier__company_name'],
                'type': 'low_stock'
            }
            for item in low_stock_parts
        ]
        
        return Response({
            'status': 'success',
            'count': len(alerts),
            'alerts': alerts
        })
    
    except Exception as e:
        # Return empty alerts if error occurs
        return Response({
            'status': 'error',
            'message': str(e),
            'count': 0,
            'alerts': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pending_approval_alerts(request):
    """
    Get pending approval alerts for notifications.
    Returns pending payments and overdue invoices.
    """
    # Get pending payments
    pending_payments = PaymentService.get_pending_payments()[:5]
    
    # Get overdue invoices
    overdue_invoices = InvoiceService.get_overdue_invoices()[:5]
    
    alerts = []
    
    # Add pending payment alerts
    from supplier.models import Supplier
    
    def get_supplier_name(val):
        val = str(val)
        if val.isdigit():
            try:
                return Supplier.objects.get(id=int(val)).company_name
            except:
                return val
        return val

    for payment in pending_payments:
        alerts.append({
            'id': f'payment_{payment.id}',
            'message': f"Payment to {get_supplier_name(payment.supplier)} pending approval",
            'type': 'pending_payment',
            'amount': float(payment.amount),
            'supplier': get_supplier_name(payment.supplier)
        })
    
    # Add overdue invoice alerts
    for invoice in overdue_invoices:
        alerts.append({
            'id': f'invoice_{invoice.id}',
            'message': f"Invoice {invoice.order} is overdue",
            'type': 'overdue_invoice',
            'amount': float(invoice.amount),
            'supplier': get_supplier_name(invoice.supplier),
            'due_date': invoice.due_date.isoformat()
        })
    
    return Response({
        'status': 'success',
        'count': len(alerts),
        'alerts': alerts
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_overview(request):
    """
    Get dashboard overview with key metrics.
    Combines payment and invoice statistics for dashboard display.
    """
    payment_stats = PaymentService.get_payment_statistics()
    invoice_stats = InvoiceService.get_invoice_statistics()
    
    overview = {
        'payments': {
            'total_amount': payment_stats['total_amount'],
            'total_count': payment_stats['total_count'],
            'pending_amount': payment_stats['pending_amount'],
            'completed_amount': payment_stats['completed_amount']
        },
        'invoices': {
            'total_amount': invoice_stats['total_amount'],
            'total_count': invoice_stats['total_count'],
            'unpaid_amount': invoice_stats['unpaid_amount'],
            'overdue_count': invoice_stats['overdue_count']
        }
    }
    
    return Response({
        'status': 'success',
        'data': overview
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def suppliers_list(request):
    """
    Get list of all suppliers for dropdown selections.
    Returns supplier names from the Supplier model.
    """
    try:
        from supplier.models import Supplier
        
        suppliers = Supplier.objects.filter(is_active=True).values('id', 'company_name')
        
        supplier_list = [
            {
                'id': item['id'],
                'name': item['company_name']
            }
            for item in suppliers
        ]
        
        return Response({
            'status': 'success',
            'data': supplier_list
        })
    
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e),
            'data': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
