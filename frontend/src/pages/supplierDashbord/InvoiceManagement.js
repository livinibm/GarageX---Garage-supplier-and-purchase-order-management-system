import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NotificationBell from '../../components/NotificationBell';
import '../../styles/supplierDashbord/InvoiceManagement.css';

// Constants
const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';

// Axios instance
const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { 'Content-Type': 'application/json' }
});

// Auth helper
const withAuth = () => {
  const token = localStorage.getItem('access_token');
  return { Authorization: `Bearer ${token}` };
};

// Utility functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount || 0);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Main Component
const InvoiceManagement = ({ user, onLogout }) => {
  const navigate = useNavigate();

  // ============= STATE =============
  const [suppliers, setSuppliers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

  // Quick Invoice Entry Form State
  const [quickInvoiceForm, setQuickInvoiceForm] = useState({
    supplier: '',
    poReference: '',
    issueDate: new Date().toISOString().split('T')[0],
    amount: '',
    status: 'Unpaid'
  });
  const [formErrors, setFormErrors] = useState({});
  const [formSaving, setFormSaving] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');

  // ============= DATA FETCHING =============
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const headers = withAuth();

        const [suppliersRes, invoicesRes] = await Promise.all([
          api.get('/suppliers/', { headers }).catch(() => ({ data: [] })),
          api.get('/invoices/', { headers }).catch(() => ({ data: [] }))
        ]);

        // Handle suppliers - extract actual supplier array
        const supplierData = suppliersRes.data?.results || suppliersRes.data?.data || suppliersRes.data || [];
        setSuppliers(Array.isArray(supplierData) ? supplierData : []);
        
        // Handle invoices - extract actual invoice array
        const invoiceData = invoicesRes.data?.results || invoicesRes.data?.data || invoicesRes.data || [];
        setInvoices(Array.isArray(invoiceData) ? invoiceData : []);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  // ============= FORM HANDLERS =============
  const validateQuickInvoice = useCallback(() => {
    const errors = {};
    if (!quickInvoiceForm.supplier) errors.supplier = 'Supplier is required';
    if (!quickInvoiceForm.amount || quickInvoiceForm.amount <= 0) errors.amount = 'Valid amount required';
    if (!quickInvoiceForm.issueDate) errors.issueDate = 'Issue date is required';
    return errors;
  }, [quickInvoiceForm]);

  const handleQuickInvoiceSubmit = async (e) => {
    e.preventDefault();
    const errors = validateQuickInvoice();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setFormSaving(true);
      setFormErrors({});
      const headers = withAuth();

      const payload = {
        supplier: quickInvoiceForm.supplier,
        order: quickInvoiceForm.poReference || 'N/A',
        amount: parseFloat(quickInvoiceForm.amount),
        due_date: quickInvoiceForm.issueDate,
        status: quickInvoiceForm.status
      };

      await api.post('/invoices/', payload, { headers });
      setFormSuccess('✓ Invoice added successfully!');
      setQuickInvoiceForm({
        supplier: '',
        poReference: '',
        issueDate: new Date().toISOString().split('T')[0],
        amount: '',
        status: 'Unpaid'
      });
      setFormErrors({});

      // Refresh invoices
      const res = await api.get('/invoices/', { headers });
      const invoiceData = res.data?.results || res.data?.data || res.data || [];
      setInvoices(Array.isArray(invoiceData) ? invoiceData : []);

      setTimeout(() => setFormSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving invoice:', error);
      setFormErrors({ general: error.response?.data?.message || 'Failed to save invoice' });
    } finally {
      setFormSaving(false);
    }
  };

  // ============= COMPUTED VALUES =============
  const invoiceStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const paid = invoices.filter(i => i.status === 'Paid');
    const unpaid = invoices.filter(i => i.status === 'Unpaid');
    const overdue = unpaid.filter(i => new Date(i.due_date) < today);

    return {
      totalAmount: invoices.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0),
      paidAmount: paid.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0),
      unpaidAmount: unpaid.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0),
      unpaidCount: unpaid.length,
      paidCount: paid.length,
      overdueCount: overdue.length
    };
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    let result = invoices;
    
    // Filter by search query
    if (searchQuery) {
      result = result.filter(i => 
        i.supplier_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        i.order?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by status
    if (statusFilter !== 'All Status') {
      result = result.filter(i => i.status === statusFilter);
    }
    
    return result.sort((a, b) => new Date(b.due_date) - new Date(a.due_date));
  }, [invoices, searchQuery, statusFilter]);

  const paginatedInvoices = useMemo(() => {
    const itemsPerPage = 8;
    const start = (currentPage - 1) * itemsPerPage;
    return filteredInvoices.slice(start, start + itemsPerPage);
  }, [filteredInvoices, currentPage]);

  const totalPages = Math.ceil(filteredInvoices.length / 8);

  // ============= RENDER =============
  if (loading) {
    return (
      <div className="invoice-page-wrapper">
        <div style={{ padding: '3rem', textAlign: 'center' }}>
          <div className="loading-spinner"></div>
          <span>Loading data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="invoice-page-wrapper">
      {/* Navigation Bar */}
      <nav className="invoice-navbar">
        <div className="invoice-navbar-container">
          <div className="invoice-navbar-brand">
            <h1>GarageX</h1>
          </div>

          {/* Desktop Navigation Menu */}
          <ul className="invoice-nav-menu">
            <li className="invoice-nav-menu-item">
              <a href="/dashboard" className="invoice-nav-menu-link">Dashboard</a>
            </li>
            <li className="invoice-nav-menu-item">
              <a href="/supplier-payment" className="invoice-nav-menu-link">Supplier Payment</a>
            </li>
            <li className="invoice-nav-menu-item">
              <a href="/invoices" className="invoice-nav-menu-link active">Invoice</a>
            </li>
            <li className="invoice-nav-menu-item">
              <a href="/reports" className="invoice-nav-menu-link">Reports</a>
            </li>
          </ul>

          {/* Search Bar */}
          <div className="invoice-navbar-search">
            <span className="invoice-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Actions */}
          <div className="invoice-navbar-actions">
            <NotificationBell buttonClass="invoice-navbar-icon-btn" dropdownWidth={400} />

            {/* User Profile */}
            <div style={{ position: 'relative' }}>
              <button
                className={`invoice-user-profile-btn ${userDropdownOpen ? 'active' : ''}`}
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              >
                <div className="invoice-user-profile-avatar">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              </button>

              {userDropdownOpen && (
                <div className="invoice-dropdown-menu active">
                  <ul className="invoice-dropdown-menu-list">
                    <li className="invoice-dropdown-menu-item">
                      <a href="#profile" className="invoice-dropdown-menu-link">My Profile</a>
                    </li>
                    <li className="invoice-dropdown-menu-item">
                      <a href="#settings" className="invoice-dropdown-menu-link">Settings</a>
                    </li>
                    <div className="invoice-dropdown-divider"></div>
                    <li className="invoice-dropdown-menu-item">
                      <button
                        onClick={onLogout}
                        className="invoice-dropdown-menu-link"
                        style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className={`invoice-mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="invoice-mobile-menu active">
          <ul className="invoice-mobile-menu-list">
            <li className="invoice-mobile-menu-item">
              <a href="/dashboard" className="invoice-mobile-menu-link">Dashboard</a>
            </li>
            <li className="invoice-mobile-menu-item">
              <a href="/supplier-payment" className="invoice-mobile-menu-link">Supplier Payment</a>
            </li>
            <li className="invoice-mobile-menu-item">
              <a href="/invoices" className="invoice-mobile-menu-link active">Invoice</a>
            </li>
            <li className="invoice-mobile-menu-item">
              <a href="/reports" className="invoice-mobile-menu-link">Reports</a>
            </li>
          </ul>
        </div>
      )}

      {/* Main Content */}
      <main className="invoice-main-content">
        {/* Summary Cards */}
        <div className="invoice-summary-grid">
          <div className="invoice-summary-card">
            <div className="invoice-summary-header">
              <span className="invoice-summary-label">Total Outstanding</span>
              <span className="invoice-summary-icon">📊</span>
            </div>
            <div className="invoice-summary-value">{formatCurrency(invoiceStats.unpaidAmount)}</div>
            <div className="invoice-summary-trend positive">
              <span>+5.2% vs last month</span>
            </div>
          </div>

          <div className="invoice-summary-card">
            <div className="invoice-summary-header">
              <span className="invoice-summary-label">Pending Invoices</span>
              <span className="invoice-summary-icon">📋</span>
            </div>
            <div className="invoice-summary-value">{invoiceStats.unpaidCount}</div>
            <div className="invoice-summary-trend warning">
              <span>1.2 new this week</span>
            </div>
          </div>

          <div className="invoice-summary-card">
            <div className="invoice-summary-header">
              <span className="invoice-summary-label">Paid (This Month)</span>
              <span className="invoice-summary-icon">✓</span>
            </div>
            <div className="invoice-summary-value">{formatCurrency(invoiceStats.paidAmount)}</div>
            <div className="invoice-summary-trend positive">
              <span>-1.4% vs target</span>
            </div>
          </div>
        </div>

        {/* Invoice Registry Table */}
        <div className="invoice-registry-panel">
          {/* Search and Filter Header */}
          <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '1.5rem', gap: '3.5rem' }}>
            <div style={{ position: 'relative', width: '180px' }}>
              <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}>
                🔍
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search invoices..."
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: '0.75rem 1rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.875rem',
                background: 'white',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option>All Status</option>
              <option>Paid</option>
              <option>Unpaid</option>
              <option>Partial</option>
            </select>
            <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700', color: '#1e293b', marginLeft: 'auto' }}>
              Invoice Registry
            </h2>
          </div>

          <div className="invoice-table-wrap">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Supplier</th>
                  <th>Order ID</th>
                  <th>Issue Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedInvoices.map((invoice, idx) => {
                  const dueDateObj = new Date(invoice.due_date);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const isOverdue = invoice.status === 'Unpaid' && dueDateObj < today;

                  return (
                    <tr key={idx}>
                      <td>
                        <span className="invoice-id-badge">#{invoice.id || invoice.order}</span>
                      </td>
                      <td>
                        <div className="invoice-supplier-cell">
                          <span className="invoice-supplier-avatar">{(invoice.supplier_name || 'S').charAt(0)}</span>
                          <span>{invoice.supplier_name || 'N/A'}</span>
                        </div>
                      </td>
                      <td>{invoice.order || '-'}</td>
                      <td>{formatDate(invoice.due_date)}</td>
                      <td>
                        <strong>{formatCurrency(invoice.amount)}</strong>
                      </td>
                      <td>
                        <span className={`invoice-status-badge invoice-status-${invoice.status?.toLowerCase() || 'unpaid'}`}>
                          {invoice.status === 'Paid' && '✓'}
                          {invoice.status === 'Unpaid' && '⏳'}
                          {invoice.status === 'Partial' && '◐'}
                          {invoice.status || 'Unpaid'}
                          {isOverdue && ' ⚠️'}
                        </span>
                      </td>
                      <td>
                        <div className="invoice-actions">
                          <button className="invoice-action-btn" title="View">👁️</button>
                          <button className="invoice-action-btn" title="Edit">✏️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', marginTop: '2rem', fontSize: '0.875rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px' }}>
              <span style={{ color: '#64748b', fontWeight: '500' }}>
                {filteredInvoices.length > 0
                  ? `Showing ${((currentPage - 1) * 8) + 1} to ${Math.min(currentPage * 8, filteredInvoices.length)} of ${filteredInvoices.length} results`
                  : 'No results found'
                }
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '0.75rem 1rem',
                    background: currentPage === 1 ? '#f1f5f9' : 'white',
                    color: currentPage === 1 ? '#cbd5e1' : '#3b82f6',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    opacity: currentPage === 1 ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage !== 1) {
                      e.target.style.background = '#eff6ff';
                      e.target.style.borderColor = '#3b82f6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'white';
                    e.target.style.borderColor = '#e2e8f0';
                  }}
                >
                  ← Prev
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    style={{
                      padding: '0.75rem 1rem',
                      background: currentPage === i + 1 ? '#3b82f6' : 'white',
                      color: currentPage === i + 1 ? 'white' : '#64748b',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      transition: 'all 0.2s',
                      boxShadow: currentPage === i + 1 ? '0 4px 12px rgba(59, 130, 246, 0.2)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== i + 1) {
                        e.target.style.background = '#eff6ff';
                        e.target.style.borderColor = '#3b82f6';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== i + 1) {
                        e.target.style.background = 'white';
                        e.target.style.borderColor = '#e2e8f0';
                      }
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '0.75rem 1rem',
                    background: currentPage === totalPages ? '#f1f5f9' : 'white',
                    color: currentPage === totalPages ? '#cbd5e1' : '#3b82f6',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    opacity: currentPage === totalPages ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage !== totalPages) {
                      e.target.style.background = '#eff6ff';
                      e.target.style.borderColor = '#3b82f6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'white';
                    e.target.style.borderColor = '#e2e8f0';
                  }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Invoice Entry Form */}
        <div className="invoice-quick-entry-panel">
          <h3 className="invoice-quick-entry-title">Quick Invoice Entry</h3>

          <form onSubmit={handleQuickInvoiceSubmit} className="invoice-quick-entry-form">
            <div className="invoice-form-row">
              <div className="invoice-form-group">
                <label className="invoice-form-label">Supplier</label>
                <select
                  className="invoice-form-select"
                  value={quickInvoiceForm.supplier}
                  onChange={(e) => setQuickInvoiceForm({ ...quickInvoiceForm, supplier: e.target.value })}
                  required
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((supplier, idx) => (
                    <option key={idx} value={supplier.id || supplier.name || supplier}>
                      {supplier.company_name || supplier.name || supplier}
                    </option>
                  ))}
                </select>
                {formErrors.supplier && <span className="invoice-error-text">{formErrors.supplier}</span>}
              </div>

              <div className="invoice-form-group">
                <label className="invoice-form-label">PO Reference</label>
                <input
                  type="text"
                  className="invoice-form-input"
                  placeholder="e.g., PO-4421"
                  value={quickInvoiceForm.poReference}
                  onChange={(e) => setQuickInvoiceForm({ ...quickInvoiceForm, poReference: e.target.value })}
                />
              </div>

              <div className="invoice-form-group">
                <label className="invoice-form-label">Issue Date</label>
                <input
                  type="date"
                  className="invoice-form-input"
                  value={quickInvoiceForm.issueDate}
                  onChange={(e) => setQuickInvoiceForm({ ...quickInvoiceForm, issueDate: e.target.value })}
                  required
                />
                {formErrors.issueDate && <span className="invoice-error-text">{formErrors.issueDate}</span>}
              </div>

              <div className="invoice-form-group">
                <label className="invoice-form-label">Amount ($)</label>
                <input
                  type="number"
                  className="invoice-form-input"
                  placeholder="0.00"
                  step="0.01"
                  value={quickInvoiceForm.amount}
                  onChange={(e) => setQuickInvoiceForm({ ...quickInvoiceForm, amount: e.target.value })}
                  required
                />
                {formErrors.amount && <span className="invoice-error-text">{formErrors.amount}</span>}
              </div>

              <div className="invoice-form-group">
                <label className="invoice-form-label">Status</label>
                <select
                  className="invoice-form-select"
                  value={quickInvoiceForm.status}
                  onChange={(e) => setQuickInvoiceForm({ ...quickInvoiceForm, status: e.target.value })}
                >
                  <option value="Unpaid">Unpaid</option>
                  <option value="Paid">Paid</option>
                  <option value="Partial">Partial</option>
                </select>
              </div>
            </div>

            {formSuccess && (
              <div className="invoice-success-message">
                {formSuccess}
              </div>
            )}

            {formErrors.general && (
              <div className="invoice-error-message">
                {formErrors.general}
              </div>
            )}

            <div className="invoice-form-actions">
              <button type="button" className="invoice-btn-secondary" onClick={() => setQuickInvoiceForm({
                supplier: '',
                poReference: '',
                issueDate: new Date().toISOString().split('T')[0],
                amount: '',
                status: 'Unpaid'
              })}>
                Clear Form
              </button>
              <button type="submit" className="invoice-btn-primary" disabled={formSaving}>
                {formSaving ? 'Submitting...' : 'Submit Invoice'}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="invoice-footer">
        <p>&copy; 2025 GaragePro Supplier Management Systems. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default InvoiceManagement;
