from django.db import models

class Supplier(models.Model):

    supplier_id = models.AutoField(primary_key=True, db_column='supplier_id') 
    supplier_name = models.CharField(max_length=100, db_column='supplier_name')
    contact_email = models.EmailField(db_column='contact_email', null=True, blank=True)
    phone_number = models.CharField(max_length=20, db_column='phone_number', null=True, blank=True)
    address = models.TextField(db_column='address', null=True, blank=True)
    is_active = models.BooleanField(default=True, db_column='is_active')

    class Meta:
        db_table = 'suppliers'  

    def __str__(self):
        return self.supplier_name

class SparePart(models.Model):
    part_id = models.AutoField(primary_key=True, db_column='part_id')
    part_name = models.CharField(max_length=100, db_column='part_name')
    sku_code = models.CharField(max_length=50, unique=True, db_column='sku_code')
   
    description = models.TextField(null=True, blank=True, db_column='description')
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, db_column='unit_price')
    current_stock = models.IntegerField(default=0, db_column='current_stock')
    
  
    supplier = models.ForeignKey(
        Supplier, 
        on_delete=models.CASCADE, 
        related_name='parts', 
        db_column='supplier_id'
    )

    class Meta:
        db_table = 'spare_parts'

# Banuka Start
class Users(models.Model):
    user_id = models.AutoField(primary_key=True, db_column='user_id')
    username = models.CharField(unique=True, max_length=50, db_column='username')
    password_hash = models.CharField(max_length=255, db_column='password_hash')
    role = models.CharField(max_length=12, db_column='role')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')

    class Meta:
        managed = False
        db_table = 'users'

    def __str__(self):
        return self.username

class PurchaseOrder(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Delivered', 'Delivered'),
        ('Cancelled', 'Cancelled'),
    )

    order_id = models.AutoField(primary_key=True, db_column='order_id')
    po_reference_number = models.CharField(max_length=20, unique=True, db_column='po_reference_number')
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='purchase_orders', db_column='supplier_id')
    created_by_user = models.ForeignKey(Users, on_delete=models.DO_NOTHING, db_column='created_by_user_id')
    order_date = models.DateTimeField(auto_now_add=True, db_column='order_date')
    expected_delivery_date = models.DateField(null=True, blank=True, db_column='expected_delivery_date')
    total_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0.00, db_column='total_amount')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending', db_column='status')
    approved_at = models.DateTimeField(null=True, blank=True, db_column='approved_at')
    delivered_at = models.DateTimeField(null=True, blank=True, db_column='delivered_at')

    class Meta:
        db_table = 'purchase_orders'
        ordering = ['-order_date']

    def __str__(self):
        return f"PO-{self.order_id} ({self.po_reference_number})"

class PurchaseOrderItem(models.Model):
    item_id = models.AutoField(primary_key=True, db_column='item_id')
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='items', db_column='order_id')
    spare_part = models.ForeignKey(SparePart, on_delete=models.CASCADE, db_column='part_id')
    quantity = models.IntegerField(db_column='quantity')
    agreed_price = models.DecimalField(max_digits=10, decimal_places=2, db_column='agreed_price')
    # line_total is a generated column in DB, removing from model to prevent INSERT errors
    # line_total = models.DecimalField(max_digits=15, decimal_places=2, db_column='line_total', editable=False, null=True)

    class Meta:
        db_table = 'purchase_order_items'

    def __str__(self):
        return f"{self.quantity} x {self.spare_part.part_name} (PO-{self.purchase_order.order_id})"

# Banuka End