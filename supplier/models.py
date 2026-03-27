from django.db import models
from django.contrib.auth.models import User

class Supplier(models.Model):
    supplier_id = models.AutoField(primary_key=True, db_column='supplier_id')
    supplier_name = models.CharField(max_length=255, db_column='supplier_name')
    contact_person = models.CharField(max_length=100, blank=True, db_column='contact_person')
    phone = models.CharField(max_length=20, blank=True, db_column='phone')
    email = models.EmailField(blank=True, db_column='email')
    address = models.TextField(blank=True, db_column='address')
    is_active = models.BooleanField(default=True, db_column='is_active')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    
    class Meta:
        db_table = 'suppliers'
        managed = False
    
    def __str__(self):
        return self.supplier_name

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
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Delivered', 'Delivered'),
    )
    
    # Match exact database field names (garagex_db.purchase_orders)
    order_id = models.AutoField(primary_key=True, db_column='order_id')
    po_reference_number = models.CharField(max_length=50, db_column='po_reference_number')
    supplier_id = models.IntegerField(db_column='supplier_id')
    created_by_user_id = models.IntegerField(db_column='created_by_user_id')
    order_date = models.DateTimeField(db_column='order_date')
    expected_delivery_date = models.DateTimeField(null=True, blank=True, db_column='expected_delivery_date')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, db_column='total_amount')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending', db_column='status')
    
    # Approval workflow fields
    approved_by = models.IntegerField(null=True, blank=True)
    approved_date = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    
    class Meta:
        db_table = 'purchase_orders'  # Match your table name
        managed = False
    
    def __str__(self):
        return f"Order-{self.order_id}"
    
    
    def approve_order(self, approved_by_user):
        """Approve the purchase order"""
        from django.utils import timezone
        self.status = 'Approved'
        self.approved_by = getattr(approved_by_user, 'id', approved_by_user)
        self.approved_date = timezone.now()
        self.save()
        
        # Create approval record
        PurchaseOrderApproval.objects.create(
            purchase_order=self,
            approved_by=approved_by_user,
            action='APPROVE'
        )
    
    def reject_order(self, approved_by_user, reason=''):
        """Reject the purchase order"""
        from django.utils import timezone
        self.status = 'Rejected'
        self.approved_by = getattr(approved_by_user, 'id', approved_by_user)
        self.approved_date = timezone.now()
        self.rejection_reason = reason
        self.save()
        
        # Create approval record
        PurchaseOrderApproval.objects.create(
            purchase_order=self,
            approved_by=approved_by_user,
            action='REJECT',
            comments=reason
        )
    
    def mark_as_received(self):
        """Mark order as received and update stock"""
        if self.status == 'ORDERED':
            self.status = 'RECEIVED'
            self.save()
            
            # Update stock for all items in the order
            for item in self.items.all():
                item.part.stock_quantity += item.quantity
                item.part.save()
            
            return True
        return False

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

class PurchaseOrderApproval(models.Model):
    """Track approval workflow for purchase orders"""
    purchase_order = models.OneToOneField(PurchaseOrder, on_delete=models.CASCADE)
    approved_by = models.ForeignKey(User, on_delete=models.CASCADE)
    approved_date = models.DateTimeField(auto_now_add=True)
    action = models.CharField(max_length=10, choices=(('APPROVE', 'Approve'), ('REJECT', 'Reject')))
    comments = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.purchase_order} - {self.action} by {self.approved_by}"
