from django.db import models
from django.contrib.auth import get_user_model
from decimal import Decimal

User = get_user_model()

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


class VendorScore(models.Model):
    score_id = models.AutoField(primary_key=True, db_column='score_id')
    supplier = models.OneToOneField(
        Supplier,
        on_delete=models.CASCADE,
        related_name='vendor_score',
        db_column='supplier_id'
    )
    score = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'), db_column='score')
    on_time_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'), db_column='on_time_rate')
    avg_approval_hours = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal('0.00'), db_column='avg_approval_hours')
    dispute_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'), db_column='dispute_rate')
    completion_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'), db_column='completion_rate')
    last_calculated_at = models.DateTimeField(auto_now=True, db_column='last_calculated_at')

    class Meta:
        db_table = 'vendor_scores'

    def __str__(self):
        return f"VendorScore({self.supplier_id})"

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
    order_date = models.DateTimeField(auto_now_add=True, db_column='order_date')
    expected_delivery_date = models.DateField(null=True, blank=True, db_column='expected_delivery_date')
    total_amount = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'), db_column='total_amount')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending', db_column='status')
    approved_at = models.DateTimeField(null=True, blank=True, db_column='approved_at')
    delivered_at = models.DateTimeField(null=True, blank=True, db_column='delivered_at')
    created_by_user = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='purchase_orders_created',
        db_column='created_by_user_id'
    )

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

# Supplier Payments & Invoice Management
class SupplierPayment(models.Model):
    PAYMENT_METHOD_CHOICES = (
        ('CASH', 'Cash'),
        ('BANK_TRANSFER', 'Bank Transfer'),
        ('CHEQUE', 'Cheque'),
        ('CARD', 'Card'),
        ('OTHER', 'Other'),
    )
    payment_id = models.AutoField(primary_key=True, db_column='payment_id')
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, db_column='supplier_id', related_name='payments')
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, db_column='order_id', related_name='payments')
    amount = models.DecimalField(max_digits=15, decimal_places=2, db_column='amount')
    payment_date = models.DateField(auto_now_add=True, db_column='payment_date')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, db_column='payment_method')
    reference_number = models.CharField(max_length=50, blank=True, null=True, db_column='reference_number')
    notes = models.TextField(blank=True, null=True, db_column='notes')

    class Meta:
        db_table = 'supplier_payments'

    def __str__(self):
        return f"Payment {self.payment_id} - {self.supplier.supplier_name} - {self.amount}"

class PurchaseInvoice(models.Model):
    invoice_id = models.AutoField(primary_key=True, db_column='invoice_id')
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, db_column='order_id', related_name='invoices')
    invoice_number = models.CharField(max_length=50, unique=True, db_column='invoice_number')
    issue_date = models.DateField(db_column='issue_date')
    due_date = models.DateField(db_column='due_date', null=True, blank=True)
    total_amount = models.DecimalField(max_digits=15, decimal_places=2, db_column='total_amount')
    status = models.CharField(max_length=20, default='Unpaid', db_column='status')
    file = models.FileField(upload_to='invoices/', null=True, blank=True, db_column='file')

    class Meta:
        db_table = 'purchase_invoices'

    def __str__(self):
        return f"Invoice {self.invoice_number} for PO-{self.purchase_order.order_id}"
