"""
Unit tests for Payment and Invoice models and API endpoints.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from .models import Payment, Invoice

User = get_user_model()


class PaymentModelTest(TestCase):
    """Test cases for Payment model"""
    
    def setUp(self):
        """Set up test data"""
        self.payment = Payment.objects.create(
            supplier='Test Supplier',
            amount=Decimal('1000.00'),
            date=timezone.now().date(),
            method='Bank Transfer',
            status='Completed'
        )
    
    def test_payment_creation(self):
        """Test payment creation"""
        self.assertEqual(self.payment.supplier, 'Test Supplier')
        self.assertEqual(self.payment.amount, Decimal('1000.00'))
        self.assertEqual(self.payment.status, 'Completed')
    
    def test_payment_string_representation(self):
        """Test payment __str__ method"""
        expected = f"Payment to Test Supplier - $1000.00 (Completed)"
        self.assertEqual(str(self.payment), expected)


class InvoiceModelTest(TestCase):
    """Test cases for Invoice model"""
    
    def setUp(self):
        """Set up test data"""
        self.invoice = Invoice.objects.create(
            supplier='Test Supplier',
            order='PO-001',
            amount=Decimal('1500.00'),
            status='Unpaid',
            due_date=timezone.now().date() + timedelta(days=30)
        )
    
    def test_invoice_creation(self):
        """Test invoice creation"""
        self.assertEqual(self.invoice.supplier, 'Test Supplier')
        self.assertEqual(self.invoice.order, 'PO-001')
        self.assertEqual(self.invoice.amount, Decimal('1500.00'))
    
    def test_invoice_overdue(self):
        """Test invoice overdue property"""
        # Not overdue
        self.assertFalse(self.invoice.is_overdue)
        
        # Make it overdue
        self.invoice.due_date = timezone.now().date() - timedelta(days=1)
        self.invoice.save()
        self.assertTrue(self.invoice.is_overdue)
        
        # Paid invoices are not overdue
        self.invoice.status = 'Paid'
        self.invoice.save()
        self.assertFalse(self.invoice.is_overdue)


class PaymentAPITest(APITestCase):
    """Test cases for Payment API endpoints"""
    
    def setUp(self):
        """Set up test client and authentication"""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        
        self.payment_data = {
            'supplier': 'API Test Supplier',
            'amount': '2000.00',
            'date': timezone.now().date().isoformat(),
            'method': 'Card',
            'status': 'Pending'
        }
    
    def test_create_payment(self):
        """Test creating a payment via API"""
        response = self.client.post('/api/payments/', self.payment_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Payment.objects.count(), 1)
        self.assertEqual(Payment.objects.get().supplier, 'API Test Supplier')
    
    def test_list_payments(self):
        """Test listing payments via API"""
        Payment.objects.create(**{
            'supplier': 'Supplier 1',
            'amount': Decimal('1000'),
            'date': timezone.now().date(),
            'method': 'Cash',
            'status': 'Completed'
        })
        response = self.client.get('/api/payments/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)


class InvoiceAPITest(APITestCase):
    """Test cases for Invoice API endpoints"""
    
    def setUp(self):
        """Set up test client and authentication"""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        
        self.invoice_data = {
            'supplier': 'API Test Supplier',
            'order': 'PO-999',
            'amount': '3000.00',
            'status': 'Unpaid',
            'due_date': (timezone.now().date() + timedelta(days=30)).isoformat()
        }
    
    def test_create_invoice(self):
        """Test creating an invoice via API"""
        response = self.client.post('/api/invoices/', self.invoice_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Invoice.objects.count(), 1)
        self.assertEqual(Invoice.objects.get().order, 'PO-999')
    
    def test_mark_invoice_paid(self):
        """Test marking invoice as paid"""
        invoice = Invoice.objects.create(**{
            'supplier': 'Test Supplier',
            'order': 'PO-100',
            'amount': Decimal('1500'),
            'status': 'Unpaid',
            'due_date': timezone.now().date() + timedelta(days=15)
        })
        response = self.client.post(f'/api/invoices/{invoice.id}/mark_paid/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        invoice.refresh_from_db()
        self.assertEqual(invoice.status, 'Paid')
