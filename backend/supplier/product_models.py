"""
Product model for stock tracking in supplier dashboard.
Extends existing Part model functionality for inventory management.
"""
from django.db import models
from django.core.validators import MinValueValidator


class Product(models.Model):
    """
    Product model for stock tracking and inventory management.
    Used in supplier dashboard for stock reports and low stock alerts.
    This can be used alongside or merged with the existing Part model.
    """
    name = models.CharField(max_length=200, help_text="Product name")
    sku = models.CharField(max_length=50, unique=True, help_text="Stock Keeping Unit")
    description = models.TextField(blank=True, help_text="Product description")
    stock_quantity = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Current stock quantity"
    )
    reorder_level = models.IntegerField(
        default=10,
        validators=[MinValueValidator(0)],
        help_text="Minimum stock level before reorder"
    )
    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Unit price"
    )
    supplier_name = models.CharField(max_length=200, help_text="Supplier name")
    is_active = models.BooleanField(default=True, help_text="Product active status")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Product'
        verbose_name_plural = 'Products'

    def __str__(self):
        return f"{self.name} ({self.sku})"

    @property
    def is_low_stock(self):
        """Check if product stock is below reorder level"""
        return self.stock_quantity <= self.reorder_level

    @property
    def stock_status(self):
        """Get stock status as string"""
        if self.stock_quantity == 0:
            return 'Out of Stock'
        elif self.is_low_stock:
            return 'Low Stock'
        else:
            return 'In Stock'
