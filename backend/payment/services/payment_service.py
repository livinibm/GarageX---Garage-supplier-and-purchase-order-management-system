"""
Service layer for payment-related business logic.
Handles complex operations like report generation and analytics.
"""
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import datetime, timedelta
from decimal import Decimal
from ..models import Payment, Invoice


class PaymentService:
    """
    Service class for payment-related operations.
    Provides methods for reports, analytics, and business logic.
    """
    
    @staticmethod
    def get_monthly_purchase_report(year=None, month=None):
        """
        Generate monthly purchase report from payments.
        Groups payments by month and calculates totals.
        
        Args:
            year: Filter by specific year (optional)
            month: Filter by specific month (optional)
        
        Returns:
            List of dictionaries with month, total_amount, count
        """
        queryset = Payment.objects.filter(status='Completed')
        
        if year:
            queryset = queryset.filter(date__year=year)
        if month:
            queryset = queryset.filter(date__month=month)
        
        # Group by month
        from django.db.models.functions import TruncMonth
        monthly_data = queryset.annotate(
            month=TruncMonth('date')
        ).values('month').annotate(
            total_amount=Sum('amount'),
            payment_count=Count('id')
        ).order_by('month')
        
        return [
            {
                'month': item['month'].strftime('%Y-%m') if item['month'] else 'Unknown',
                'total_amount': float(item['total_amount'] or 0),
                'count': item['payment_count']
            }
            for item in monthly_data
        ]
    
    @staticmethod
    def get_supplier_summary():
        """
        Get payment summary grouped by supplier.
        
        Returns:
            List of suppliers with total payments and amounts
        """
        summary = Payment.objects.values('supplier').annotate(
            total_amount=Sum('amount'),
            payment_count=Count('id')
        ).order_by('-total_amount')
        
        return [
            {
                'supplier': item['supplier'],
                'total_amount': float(item['total_amount'] or 0),
                'count': item['payment_count']
            }
            for item in summary
        ]
    
    @staticmethod
    def get_pending_payments():
        """
        Get all pending payments.
        
        Returns:
            QuerySet of pending payments
        """
        return Payment.objects.filter(status='Pending').order_by('date')
    
    @staticmethod
    def get_payment_statistics(start_date=None, end_date=None):
        """
        Calculate payment statistics for a date range.
        
        Args:
            start_date: Start date for filtering (optional)
            end_date: End date for filtering (optional)
        
        Returns:
            Dictionary with various statistics
        """
        queryset = Payment.objects.all()
        
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        total_amount = queryset.aggregate(total=Sum('amount'))['total'] or 0
        total_count = queryset.count()
        
        completed_amount = queryset.filter(status='Completed').aggregate(total=Sum('amount'))['total'] or 0
        pending_amount = queryset.filter(status='Pending').aggregate(total=Sum('amount'))['total'] or 0
        failed_amount = queryset.filter(status='Failed').aggregate(total=Sum('amount'))['total'] or 0
        
        return {
            'total_amount': float(total_amount),
            'total_count': total_count,
            'completed_amount': float(completed_amount),
            'pending_amount': float(pending_amount),
            'failed_amount': float(failed_amount),
            'average_amount': float(total_amount / total_count) if total_count > 0 else 0
        }


class InvoiceService:
    """
    Service class for invoice-related operations.
    Provides methods for invoice management and analytics.
    """
    
    @staticmethod
    def get_overdue_invoices():
        """
        Get all overdue unpaid invoices.
        
        Returns:
            QuerySet of overdue invoices
        """
        return Invoice.objects.filter(
            due_date__lt=timezone.now().date()
        ).exclude(status='Paid').order_by('due_date')
    
    @staticmethod
    def get_upcoming_invoices(days=7):
        """
        Get invoices due within the next X days.
        
        Args:
            days: Number of days to look ahead (default: 7)
        
        Returns:
            QuerySet of upcoming invoices
        """
        today = timezone.now().date()
        future_date = today + timedelta(days=days)
        
        return Invoice.objects.filter(
            due_date__gte=today,
            due_date__lte=future_date
        ).exclude(status='Paid').order_by('due_date')
    
    @staticmethod
    def get_invoice_statistics():
        """
        Calculate invoice statistics.
        
        Returns:
            Dictionary with various statistics
        """
        total_amount = Invoice.objects.aggregate(total=Sum('amount'))['total'] or 0
        total_count = Invoice.objects.count()
        
        paid_amount = Invoice.objects.filter(status='Paid').aggregate(total=Sum('amount'))['total'] or 0
        unpaid_amount = Invoice.objects.filter(status='Unpaid').aggregate(total=Sum('amount'))['total'] or 0
        
        overdue_count = InvoiceService.get_overdue_invoices().count()
        overdue_amount = InvoiceService.get_overdue_invoices().aggregate(total=Sum('amount'))['total'] or 0
        
        return {
            'total_amount': float(total_amount),
            'total_count': total_count,
            'paid_amount': float(paid_amount),
            'unpaid_amount': float(unpaid_amount),
            'overdue_count': overdue_count,
            'overdue_amount': float(overdue_amount)
        }
    
    @staticmethod
    def mark_invoice_paid(invoice_id):
        """
        Mark an invoice as paid.
        
        Args:
            invoice_id: ID of the invoice to mark as paid
        
        Returns:
            Updated invoice instance
        """
        invoice = Invoice.objects.get(id=invoice_id)
        invoice.status = 'Paid'
        invoice.save()
        return invoice
    
    @staticmethod
    def get_supplier_invoices(supplier_name):
        """
        Get all invoices for a specific supplier.
        
        Args:
            supplier_name: Name of the supplier
        
        Returns:
            QuerySet of invoices for the supplier
        """
        return Invoice.objects.filter(supplier=supplier_name).order_by('-created_at')
