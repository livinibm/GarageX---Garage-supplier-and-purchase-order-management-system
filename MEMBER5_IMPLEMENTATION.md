# GarageX Member 5 - Supplier Financial Management

This document outlines the complete implementation of Member 5 features for the GarageX Management System.

## Overview

Member 5 handles supplier financial management including:
- Payment tracking and management
- Invoice generation and monitoring
- Financial reports and analytics
- Low stock and payment approval notifications

## Backend Implementation

### 1. Payment App Structure

**Location**: `backend/payment/`

**Models** (`models.py`):
- `Payment`: Tracks all payments to suppliers
  - Fields: supplier, amount, date, method, status
  - Choices: Payment method (Bank Transfer, Card, Cash, Cheque), Status (Completed, Pending, Failed)
  
- `Invoice`: Manages invoices for purchase orders
  - Fields: supplier, order, amount, status, due_date
  - Choices: Status (Unpaid, Paid, Partial)
  - Property: `is_overdue` - checks if invoice is past due

**Serializers** (`serializers.py`):
- `PaymentSerializer`: Validates payment data
- `InvoiceSerializer`: Validates invoice data with computed is_overdue field

**Views** (`views.py`):
- `PaymentViewSet`: Full CRUD operations for payments
  - Filter by status and date range
  - Summary endpoint for statistics
  
- `InvoiceViewSet`: Full CRUD operations for invoices
  - Filter by status and overdue flag
  - Summary endpoint for statistics
  - mark_paid action endpoint

**Report Views** (`report_views.py`):
- `monthly_purchase_report`: Aggregated monthly payment data
- `supplier_report`: Payment totals grouped by supplier
- `stock_report`: Low stock items from Part model
- `low_stock_alerts`: Notifications for items at/below minimum level
- `pending_approval_alerts`: Pending payments and overdue invoices
- `dashboard_overview`: Combined payment/invoice statistics
- `suppliers_list`: All active suppliers for dropdowns

**Services** (`services/payment_service.py`):
- `PaymentService`: Business logic for payment operations
  - Monthly purchase reports
  - Supplier payment summaries
  - Payment statistics
  
- `InvoiceService`: Business logic for invoice operations
  - Overdue invoice tracking
  - Upcoming invoices (due within X days)
  - Invoice statistics

**URLs** (`urls.py`):
```
/api/payments/ - Payment CRUD
/api/invoices/ - Invoice CRUD
/api/reports/monthly-purchases/ - Monthly purchase report
/api/reports/suppliers/ - Supplier payment summary
/api/reports/stock/ - Stock level report
/api/notifications/low-stock/ - Low stock alerts
/api/notifications/pending-approvals/ - Pending approvals
/api/dashboard/overview/ - Dashboard metrics
/api/suppliers/ - Supplier list
```

### 2. Database Schema

**Payment Table**:
- id (primary key)
- supplier (varchar 200)
- amount (decimal 10,2)
- date (date)
- method (varchar 20)
- status (varchar 20)
- created_at (datetime)
- updated_at (datetime)

**Invoice Table**:
- id (primary key)
- supplier (varchar 200)
- order (varchar 100)
- amount (decimal 10,2)
- status (varchar 20)
- due_date (date)
- created_at (datetime)
- updated_at (datetime)

### 3. Integration with Existing Models

The backend integrates with:
- `Supplier` model from supplier app (for supplier list and company names)
- `Part` model from supplier app (for stock tracking and low stock alerts)

## Frontend Implementation

### 1. Component Structure

**Main Component**: `frontend/src/pages/supplierDashbord/SupplierDashboard.js`

**Features**:
1. **Overview Tab**
   - Quick metrics (suppliers count, open invoices, pending payments, alerts)
   - Shortcut buttons to other sections

2. **Payments Tab**
   - Add/edit payment form with validation
   - Payments table with status filtering (All, Completed, Pending, Failed)
   - Edit functionality

3. **Invoices Tab**
   - Generate/update invoice form
   - Sortable invoice table (by supplier, order, amount, status, due date)
   - Filterable by status (All, Unpaid, Paid, Partial)

4. **Reports Tab**
   - Monthly purchase report with month/supplier filters
   - Stock level report with low stock filter
   - Visual metrics for transactions and totals

5. **Notifications Tab**
   - Low stock alerts (from Part model)
   - Pending approval alerts (pending payments + overdue invoices)

### 2. API Integration

**Axios Configuration**:
```javascript
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000',
  headers: { 'Content-Type': 'application/json' }
});
```

**Authentication**: Bearer token from localStorage attached to all requests

**Endpoints Used**:
- GET `/api/suppliers/` - Load supplier dropdown options
- GET/POST/PUT `/api/payments/` - Payment CRUD
- GET/POST/PUT `/api/invoices/` - Invoice CRUD
- GET `/api/reports/stock/` - Stock data
- GET `/api/notifications/low-stock/` - Low stock alerts
- GET `/api/notifications/pending-approvals/` - Approval alerts

### 3. State Management

**Component State**:
- Active tab navigation
- Payments (list, form, loading, errors)
- Invoices (list, form, sorting, filtering)
- Reports (filters, month selection, supplier selection)
- Notifications (low stock, pending approvals)
- Suppliers list (for dropdowns)

**Form Validation**:
- Required field checks
- Positive amount validation
- Date validation

### 4. Styling

**File**: `frontend/src/styles/supplierDashbord/SupplierDashboard.css`

**Features**:
- Modern card-based layout
- Responsive grid system (auto-fit columns)
- Tag badges for status indicators
- Sortable table headers
- Alert cards for notifications
- Form controls with focus states
- Mobile-responsive breakpoints

## Setup Instructions

### Backend Setup

1. **Install payment app**:
   - Already added to `INSTALLED_APPS` in settings.py
   - Migration files created and applied

2. **Run migrations**:
```bash
cd backend
python manage.py migrate payment
```

3. **Start server**:
```bash
python manage.py runserver
```

### Frontend Setup

1. **Environment variables**:
Create `.env` file in frontend directory:
```
REACT_APP_API_BASE=http://127.0.0.1:8000
```

2. **Install dependencies** (if not already done):
```bash
cd frontend
npm install axios react-router-dom bootstrap
```

3. **Start development server**:
```bash
npm start
```

## Testing

### Backend Tests

Run tests:
```bash
cd backend
python manage.py test payment
```

Test coverage includes:
- Model creation and validation
- API endpoints (CRUD operations)
- Invoice overdue logic
- Payment/Invoice filtering

### Manual Testing Checklist

**Payments**:
- [ ] Add new payment
- [ ] Edit existing payment
- [ ] Filter payments by status
- [ ] View payment in table

**Invoices**:
- [ ] Generate new invoice
- [ ] Update invoice status
- [ ] Sort invoices by different columns
- [ ] Filter invoices by status

**Reports**:
- [ ] View monthly purchases
- [ ] Filter by month
- [ ] Filter by supplier
- [ ] View stock levels
- [ ] Filter low stock only

**Notifications**:
- [ ] See low stock alerts
- [ ] See pending payment alerts
- [ ] See overdue invoice alerts

## API Endpoints Reference

### Payments

**List/Create Payments**:
```
GET/POST /api/payments/
```

**Retrieve/Update/Delete Payment**:
```
GET/PUT/DELETE /api/payments/{id}/
```

**Payment Summary**:
```
GET /api/payments/summary/
```

### Invoices

**List/Create Invoices**:
```
GET/POST /api/invoices/
```

**Retrieve/Update/Delete Invoice**:
```
GET/PUT/DELETE /api/invoices/{id}/
```

**Invoice Summary**:
```
GET /api/invoices/summary/
```

**Mark Invoice Paid**:
```
POST /api/invoices/{id}/mark_paid/
```

### Reports

**Monthly Purchases**:
```
GET /api/reports/monthly-purchases/?year=2025&month=1
```

**Supplier Report**:
```
GET /api/reports/suppliers/?supplier=Auto Parts Co
```

**Stock Report**:
```
GET /api/reports/stock/?threshold=10
```

### Notifications

**Low Stock Alerts**:
```
GET /api/notifications/low-stock/
```

**Pending Approvals**:
```
GET /api/notifications/pending-approvals/
```

### Dashboard

**Overview Metrics**:
```
GET /api/dashboard/overview/
```

**Suppliers List**:
```
GET /api/suppliers/
```

## Field Mappings

### Frontend to Backend

**Payment**:
- Frontend: `{ supplier, amount, date, method, status }`
- Backend: Same fields

**Invoice**:
- Frontend: `{ supplier, order, amount, dueDate, status }`
- Backend: `{ supplier, order, amount, due_date, status }`
- Note: `dueDate` → `due_date` conversion in API calls

**Stock**:
- Backend Response: `{ id, product, part_number, stock, reorder_level, supplier }`
- Frontend Display: Maps to table columns

## Security

**Authentication**: JWT Bearer token required for all endpoints

**Permissions**: `IsAuthenticated` permission class on all views

**CORS**: Enabled for local development (configure for production)

## Future Enhancements

1. **Pagination**: Add pagination for large payment/invoice lists
2. **Charts**: Add visual charts for reports using Chart.js or Recharts
3. **Export**: PDF/Excel export for reports
4. **Email Notifications**: Automated emails for overdue invoices
5. **Bulk Operations**: Bulk payment/invoice updates
6. **Advanced Filters**: Date ranges, amount ranges, multi-select filters
7. **Audit Trail**: Track who created/modified payments/invoices

## Troubleshooting

**Issue**: API returns 401 Unauthorized
- **Solution**: Check that access_token is in localStorage and valid

**Issue**: Invoices not showing
- **Solution**: Check backend has data, verify API endpoint is correct

**Issue**: Stock report is empty
- **Solution**: Ensure Part model has data with stock_quantity and min_stock_level fields

**Issue**: Suppliers dropdown is empty
- **Solution**: Create Supplier records in Django admin or via API

## Maintenance

**Adding New Payment Method**:
1. Update `PAYMENT_METHOD_CHOICES` in `backend/payment/models.py`
2. Run migrations
3. No frontend changes needed (dropdown is dynamic)

**Adding New Invoice Status**:
1. Update `STATUS_CHOICES` in Invoice model
2. Run migrations  
3. Update frontend status options in invoice form

**Modifying Reports**:
1. Update `PaymentService` or `InvoiceService` in `backend/payment/services/`
2. Update corresponding view in `report_views.py`
3. Frontend will automatically use new data structure
