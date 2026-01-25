"""
Django admin configuration for Payment and Invoice models.
Provides admin interface for managing payments and invoices.
"""
from django.contrib import admin
from .models import Payment, Invoice


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """
    Admin interface for Payment model.
    Provides filtering, searching, and organized display.
    """
    list_display = ['id', 'supplier', 'amount', 'date', 'method', 'status', 'created_at']
    list_filter = ['status', 'method', 'date']
    search_fields = ['supplier', 'id']
    ordering = ['-date', '-created_at']
    date_hierarchy = 'date'
    
    fieldsets = (
        ('Payment Information', {
            'fields': ('supplier', 'amount', 'date', 'method')
        }),
        ('Status', {
            'fields': ('status',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    """
    Admin interface for Invoice model.
    Provides filtering, searching, and organized display with overdue highlighting.
    """
    list_display = ['id', 'supplier', 'order', 'amount', 'status', 'due_date', 'is_overdue', 'created_at']
    list_filter = ['status', 'due_date']
    search_fields = ['supplier', 'order', 'id']
    ordering = ['due_date', '-created_at']
    date_hierarchy = 'due_date'
    
    fieldsets = (
        ('Invoice Information', {
            'fields': ('supplier', 'order', 'amount', 'due_date')
        }),
        ('Status', {
            'fields': ('status',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    def is_overdue(self, obj):
        """Display overdue status in admin list"""
        return obj.is_overdue
    is_overdue.boolean = True
    is_overdue.short_description = 'Overdue'
