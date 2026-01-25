"""
API views for Payment and Invoice management.
Provides CRUD operations with filtering and authentication.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Sum, Count
from django.utils import timezone
from datetime import datetime
from .models import Payment, Invoice
from .serializers import PaymentSerializer, InvoiceSerializer


class PaymentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Payment model.
    Provides list, create, retrieve, update, and delete operations.
    Supports filtering by status and date range.
    """
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filter payments based on query parameters.
        Supports status filter and date range filtering.
        """
        queryset = Payment.objects.all()
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter and status_filter != 'ALL':
            queryset = queryset.filter(status=status_filter)
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)
        
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
        
        return queryset

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """
        Get payment summary statistics.
        Returns total amount, count, and breakdown by status.
        """
        queryset = self.get_queryset()
        
        total_amount = queryset.aggregate(total=Sum('amount'))['total'] or 0
        total_count = queryset.count()
        
        by_status = {}
        for choice in Payment.STATUS_CHOICES:
            status_key = choice[0]
            status_count = queryset.filter(status=status_key).count()
            status_amount = queryset.filter(status=status_key).aggregate(total=Sum('amount'))['total'] or 0
            by_status[status_key] = {
                'count': status_count,
                'amount': float(status_amount)
            }
        
        return Response({
            'total_amount': float(total_amount),
            'total_count': total_count,
            'by_status': by_status
        })


class InvoiceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Invoice model.
    Provides list, create, retrieve, update, and delete operations.
    Supports filtering by status and includes overdue invoice tracking.
    """
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filter invoices based on query parameters.
        Supports status filter and overdue filter.
        """
        queryset = Invoice.objects.all()
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter and status_filter != 'ALL':
            queryset = queryset.filter(status=status_filter)
        
        # Filter overdue invoices
        overdue = self.request.query_params.get('overdue', None)
        if overdue == 'true':
            queryset = queryset.filter(
                due_date__lt=timezone.now().date()
            ).exclude(status='Paid')
        
        return queryset

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """
        Get invoice summary statistics.
        Returns total amount, count, overdue count, and breakdown by status.
        """
        queryset = self.get_queryset()
        
        total_amount = queryset.aggregate(total=Sum('amount'))['total'] or 0
        total_count = queryset.count()
        
        overdue_count = queryset.filter(
            due_date__lt=timezone.now().date()
        ).exclude(status='Paid').count()
        
        by_status = {}
        for choice in Invoice.STATUS_CHOICES:
            status_key = choice[0]
            status_count = queryset.filter(status=status_key).count()
            status_amount = queryset.filter(status=status_key).aggregate(total=Sum('amount'))['total'] or 0
            by_status[status_key] = {
                'count': status_count,
                'amount': float(status_amount)
            }
        
        return Response({
            'total_amount': float(total_amount),
            'total_count': total_count,
            'overdue_count': overdue_count,
            'by_status': by_status
        })

    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """
        Mark an invoice as paid.
        Convenience endpoint to update invoice status to 'Paid'.
        """
        invoice = self.get_object()
        invoice.status = 'Paid'
        invoice.save()
        serializer = self.get_serializer(invoice)
        return Response(serializer.data)
