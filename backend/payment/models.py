"""
Payment and Invoice models for GarageX supplier financial management.
Handles payment tracking and invoice generation for supplier transactions.
"""
from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal


class Payment(models.Model):
    """
    Payment model to track all payments made to suppliers.
    Supports multiple payment methods and status tracking.
    """
    PAYMENT_METHOD_CHOICES = [
        ('Bank Transfer', 'Bank Transfer'),
        ('Card', 'Card'),
        ('Cash', 'Cash'),
        ('Cheque', 'Cheque'),
    ]
    
    STATUS_CHOICES = [
        ('Completed', 'Completed'),
        ('Pending', 'Pending'),
        ('Failed', 'Failed'),
    ]

    supplier = models.CharField(max_length=200, help_text="Supplier name")
    amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Payment amount"
    )
    date = models.DateField(help_text="Payment date")
    method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        default='Bank Transfer',
        help_text="Payment method"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='Completed',
        help_text="Payment status"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name = 'Payment'
        verbose_name_plural = 'Payments'

    def __str__(self):
        return f"Payment to {self.supplier} - ${self.amount} ({self.status})"


class Invoice(models.Model):
    """
    Invoice model to manage invoices for supplier orders.
    Tracks invoice status and payment deadlines.
    """
    STATUS_CHOICES = [
        ('Unpaid', 'Unpaid'),
        ('Paid', 'Paid'),
        ('Partial', 'Partial'),
    ]

    supplier = models.CharField(max_length=200, help_text="Supplier name")
    order = models.CharField(max_length=100, help_text="Purchase order ID")
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Invoice total amount"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='Unpaid',
        help_text="Invoice payment status"
    )
    due_date = models.DateField(help_text="Payment due date")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['due_date', '-created_at']
        verbose_name = 'Invoice'
        verbose_name_plural = 'Invoices'

    def __str__(self):
        return f"Invoice for {self.order} - {self.supplier} - ${self.amount} ({self.status})"

    @property
    def is_overdue(self):
        """Check if invoice is overdue based on due_date and status"""
        from django.utils import timezone
        return self.status != 'Paid' and self.due_date < timezone.now().date()
