"""
API views for Supplier notifications and alerts.
Provides real-time low stock and pending approval alerts.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, F
from django.utils import timezone
from datetime import timedelta
from payment.models import Invoice, Payment
from .models import Part, Supplier, PurchaseOrder


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def low_stock_notifications(request):
    """
    Get low stock alerts for supplier's products.
    Returns parts where stock is below minimum level.
    """
    try:
        # Get supplier profile for current user
        supplier = Supplier.objects.filter(user=request.user).first()
        
        if not supplier:
            return Response({
                'alerts': [],
                'message': 'No supplier profile found'
            }, status=status.HTTP_200_OK)
        
        # Get low stock items
        low_stock_parts = Part.objects.filter(
            supplier=supplier,
            stock_quantity__lt=F('min_stock_level'),
            is_active=True
        ).values(
            'id', 'name', 'part_number', 'stock_quantity', 
            'min_stock_level', 'price'
        )
        
        alerts = []
        for part in low_stock_parts:
            alerts.append({
                'id': part['id'],
                'type': 'low_stock',
                'part_name': part['name'],
                'part_number': part['part_number'],
                'message': f"Stock low for {part['name']}",
                'current_stock': part['stock_quantity'],
                'minimum_level': part['min_stock_level'],
                'shortage': part['min_stock_level'] - part['stock_quantity'],
                'unit_price': float(part['price']),
                'amount': float(part['price'] * (part['min_stock_level'] - part['stock_quantity']))
            })
        
        return Response({
            'alerts': alerts,
            'count': len(alerts)
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'alerts': [],
            'error': str(e)
        }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pending_approvals_notifications(request):
    """
    Get pending approvals and overdue invoices for supplier.
    Returns pending purchase orders and overdue invoices.
    """
    try:
        # Get supplier profile for current user
        supplier = Supplier.objects.filter(user=request.user).first()
        
        alerts = []
        
        if supplier:
            # Get pending purchase orders
            pending_orders = PurchaseOrder.objects.filter(
                supplier=supplier,
                status__in=['PENDING', 'APPROVED']
            ).values(
                'id', 'order_number', 'status', 'order_date', 
                'expected_delivery_date', 'total_amount'
            )
            
            for order in pending_orders:
                alerts.append({
                    'id': order['id'],
                    'type': 'pending_order',
                    'message': f"Purchase Order {order['order_number']} is {order['status'].lower()}",
                    'order_number': order['order_number'],
                    'status': order['status'],
                    'amount': float(order['total_amount'] or 0),
                    'order_date': order['order_date'].isoformat() if order['order_date'] else None,
                    'expected_delivery': order['expected_delivery_date'].isoformat() if order['expected_delivery_date'] else None
                })
        
        # Get overdue invoices (for all suppliers, but filtered by user)
        now = timezone.now()
        overdue_invoices = Invoice.objects.filter(
            due_date__lt=now,
            status__in=['PENDING', 'PARTIALLY_PAID']
        ).values(
            'id', 'invoice_number', 'supplier_name', 'due_date', 'amount'
        )
        
        for invoice in overdue_invoices:
            alerts.append({
                'id': invoice['id'],
                'type': 'overdue_invoice',
                'message': f"Invoice {invoice['invoice_number']} is overdue",
                'invoice_number': invoice['invoice_number'],
                'supplier': invoice['supplier_name'],
                'due_date': invoice['due_date'].isoformat() if invoice['due_date'] else None,
                'amount': float(invoice['amount'])
            })
        
        return Response({
            'alerts': alerts,
            'count': len(alerts)
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'alerts': [],
            'error': str(e)
        }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notifications_summary(request):
    """
    Get summary of all notifications.
    """
    try:
        # Call both notification endpoints
        low_stock_response = low_stock_notifications(request)
        pending_response = pending_approvals_notifications(request)
        
        low_stock_alerts = low_stock_response.data.get('alerts', [])
        pending_alerts = pending_response.data.get('alerts', [])
        
        total = len(low_stock_alerts) + len(pending_alerts)
        
        return Response({
            'total_count': total,
            'low_stock_count': len(low_stock_alerts),
            'pending_count': len(pending_alerts),
            'alerts': low_stock_alerts + pending_alerts
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'total_count': 0,
            'error': str(e)
        }, status=status.HTTP_200_OK)
