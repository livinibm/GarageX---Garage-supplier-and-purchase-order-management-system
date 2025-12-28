from django.db import models
from django.contrib.auth.models import User

class Supplier(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    company_name = models.CharField(max_length=200)
    contact_person = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    email = models.EmailField()
    address = models.TextField()
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.company_name

class Part(models.Model):
    PART_TYPES = (
        ('ENGINE', 'Engine Parts'),
        ('BRAKE', 'Brake System'),
        ('ELECTRICAL', 'Electrical Components'),
        ('SUSPENSION', 'Suspension'),
        ('TRANSMISSION', 'Transmission'),
        ('BODY', 'Body Parts'),
        ('OTHER', 'Other'),
    )
    
    name = models.CharField(max_length=100)
    part_number = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    part_type = models.CharField(max_length=20, choices=PART_TYPES)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock_quantity = models.IntegerField(default=0)
    min_stock_level = models.IntegerField(default=5)
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.name} ({self.part_number})"

class PurchaseOrder(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('ORDERED', 'Ordered'),
        ('RECEIVED', 'Received'),
        ('CANCELLED', 'Cancelled'),
    )
    
    order_number = models.CharField(max_length=20, unique=True)
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE)
    ordered_by = models.ForeignKey(User, on_delete=models.CASCADE)
    order_date = models.DateTimeField(auto_now_add=True)
    expected_delivery_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True)
    
    def __str__(self):
        return f"PO-{self.order_number}"

class PurchaseOrderItem(models.Model):
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='items')
    part = models.ForeignKey(Part, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    def save(self, *args, **kwargs):
        self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.part.name} x {self.quantity}"
