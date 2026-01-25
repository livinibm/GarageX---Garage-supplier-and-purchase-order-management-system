import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NotificationBell from '../../components/NotificationBell';
import '../../styles/supplierDashbord/SupplierDashboard.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE}/api`
});

// Helper function to add auth header
const withAuth = () => {
  const token = localStorage.getItem('access_token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

const SupplierPayment = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentFilter, setPaymentFilter] = useState('Last 30 Days');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('0.00');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [toast, setToast] = useState(null); // popup feedback messages
  const toastTimer = useRef(null);

  const showToast = (message, type = 'info', duration = 3500) => {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), duration);
  };



  const fetchAllData = async () => {
    try {
      const [paymentsRes, suppliersRes, lowStockRes, pendingRes] = await Promise.all([
        api.get('/payments/', withAuth()),
        api.get('/suppliers/', withAuth()),
        api.get('/notifications/low-stock/', withAuth()),
        api.get('/notifications/pending-approvals/', withAuth())
      ]);

      // Handle payments response
      const paymentsData = Array.isArray(paymentsRes.data) ? paymentsRes.data : paymentsRes.data?.results || [];
      setPayments(paymentsData);

      // Handle suppliers response - expects { status, data: [{id, name}, ...] }
      const suppliersData = suppliersRes.data?.data || [];
      setSuppliers(suppliersData);

      // Combine notifications
      const lowStockAlerts = (lowStockRes.data?.alerts || []).map(a => ({
        ...a,
        title: 'Low Stock Alert',
        icon: '⚠️',
        color: '#ef4444',
        time: 'Just now'
      }));

      const pendingAlerts = (pendingRes.data?.alerts || []).map(a => ({
        ...a,
        title: a.type === 'overdue_invoice' ? 'Overdue Invoice' : 'Pending Approval',
        icon: '⏳',
        color: '#f97316',
        time: 'Action required'
      }));

      // Debug logs
      console.log('Payments fetched:', paymentsData);
      console.log('Suppliers fetched:', suppliersData);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();

    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    };
  }, []);



  const filteredPayments = payments.filter(payment =>
    (payment.supplier_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (payment.id.toString() || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#10b981';
      case 'Pending': return '#f97316';
      case 'Failed': return '#ef4444';
      default: return '#64748b';
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedSupplier || !paymentAmount || !paymentDate) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    // Map UI payment method buttons to API allowed choices
    const methodMap = {
      bank: 'Bank Transfer',
      card: 'Card',
      cash: 'Cash',
      credit: 'Cheque',
    };

    const apiMethod = methodMap[paymentMethod] || 'Bank Transfer';

    try {
      await api.post('/payments/', {
        supplier: selectedSupplier,
        amount: parseFloat(paymentAmount),
        date: paymentDate,
        method: apiMethod,
        status: 'Completed' // Defaulting to Completed for now, or could vary
      }, withAuth());

      showToast('Payment recorded successfully!', 'success');

      // Reset form
      setSelectedSupplier('');
      setPaymentAmount('0.00');
      setPaymentDate('');
      setPaymentNotes('');

      // Refresh data
      fetchAllData();

    } catch (error) {
      console.error('Error recording payment:', error);
      const apiMessage = error?.response?.data || 'Failed to record payment';
      showToast(typeof apiMessage === 'string' ? apiMessage : 'Failed to record payment', 'error', 4500);
    }
  };

  return (
    <div className="invoice-page-wrapper">
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <p>Loading payments and suppliers...</p>
          </div>
        </div>
      )}

      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1100,
          animation: 'slideDown 0.3s ease-out'
        }}>
          <div style={{
            minWidth: '340px',
            maxWidth: '520px',
            borderRadius: '14px',
            boxShadow: '0 20px 50px rgba(37, 99, 235, 0.15)',
            overflow: 'hidden',
            background: '#ffffff',
            color: '#1e293b',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            backdropFilter: 'blur(10px)',
            border: '1.5px solid #3b82f6'
          }}>
            <div style={{
              fontSize: '2rem',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: toast.type === 'success'
                ? '#dbeafe'
                : toast.type === 'error'
                ? '#dbeafe'
                : '#dbeafe'
            }}>
              {toast.type === 'success' && '✅'}
              {toast.type === 'error' && '⚠️'}
              {toast.type === 'info' && 'ℹ️'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '0.95rem',
                lineHeight: 1.6,
                fontWeight: '600',
                letterSpacing: '0.2px',
                wordBreak: 'break-word',
                color: '#1e293b'
              }}>
                {toast.message}
              </div>
            </div>
            <button
              onClick={() => setToast(null)}
              style={{
                background: '#3b82f6',
                border: 'none',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer',
                borderRadius: '8px',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.3s ease',
                fontWeight: '300',
                lineHeight: '1'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#2563eb';
                e.target.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#3b82f6';
                e.target.style.transform = 'scale(1)';
              }}
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
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
              <a href="/supplier-payment" className="invoice-nav-menu-link active">Supplier Payment</a>
            </li>
            <li className="invoice-nav-menu-item">
              <a href="/invoices" className="invoice-nav-menu-link">Invoice</a>
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
              placeholder="Search payments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="invoice-navbar-actions">
            {/* Notifications Bell */}
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
              <a href="/supplier-payment" className="invoice-mobile-menu-link active">Supplier Payment</a>
            </li>
            <li className="invoice-mobile-menu-item">
              <a href="/invoices" className="invoice-mobile-menu-link">Invoice</a>
            </li>
            <li className="invoice-mobile-menu-item">
              <a href="/reports" className="invoice-mobile-menu-link">Reports</a>
            </li>
          </ul>
        </div>
      )}

      {/* Main Content */}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)', background: '#f5f7fa', flexDirection: 'column' }}>
        {/* Main Content */}
        <div style={{ flex: 1 }}>
          {/* Top Bar */}
          <div style={{
            background: 'white',
            borderBottom: '1px solid #e2e8f0',
            padding: '1.5rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div />
            <div style={{
              padding: '0.65rem 1.1rem',
              background: '#e0f2fe',
              border: '1px solid #bfdbfe',
              borderRadius: '999px',
              color: '#1e40af',
              fontWeight: '700',
              fontSize: '0.85rem'
            }}>
              Live data synced
            </div>
          </div>

          {/* Content Area */}
          <div style={{ display: 'flex', gap: '2rem', padding: '2rem' }}>
            {/* Left Section - Record Payment */}
            <div style={{ width: '380px', flexShrink: 0 }}>
              {/* Record Payment Card */}
              <div style={{
                background: 'linear-gradient(135deg, #2d5a8a 0%, #1e3c50 100%)',
                borderRadius: '14px',
                padding: '1.75rem 1.5rem',
                color: 'white',
                marginBottom: '1.25rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
              }}>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.375rem', fontWeight: '700', letterSpacing: '-0.5px' }}>
                  💰 Record Payment
                </h3>
                <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.875rem', opacity: 0.85, color: '#cbd5e1' }}>
                  Log a new supplier payment
                </p>

                {/* Select Supplier */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.9 }}>
                    Select Supplier
                  </label>
                  <select
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.875rem',
                      background: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      border: '1.5px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.background = 'rgba(255,255,255,0.15)';
                      e.target.style.borderColor = 'rgba(255,255,255,0.4)';
                    }}
                    onBlur={(e) => {
                      e.target.style.background = 'rgba(255,255,255,0.1)';
                      e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                    }}
                  >
                    <option value="" style={{ background: '#1e3c50' }}>
                      {suppliers.length === 0 ? 'No suppliers available' : 'Search suppliers...'}
                    </option>
                    {suppliers.length > 0 && suppliers.map(s => (
                      <option key={s.id} value={s.id} style={{ background: '#1e3c50' }}>{s.name || s.company_name || 'Unknown'}</option>
                    ))}
                  </select>
                </div>

                {/* Amount */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.9 }}>
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.875rem',
                      background: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      border: '1.5px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box'
                    }}
                    placeholder="0.00"
                    onFocus={(e) => {
                      e.target.style.background = 'rgba(255,255,255,0.15)';
                      e.target.style.borderColor = 'rgba(255,255,255,0.4)';
                    }}
                    onBlur={(e) => {
                      e.target.style.background = 'rgba(255,255,255,0.1)';
                      e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                    }}
                  />
                </div>

                {/* Date */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.9 }}>
                    Date
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.875rem',
                      background: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      border: '1.5px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.background = 'rgba(255,255,255,0.15)';
                      e.target.style.borderColor = 'rgba(255,255,255,0.4)';
                    }}
                    onBlur={(e) => {
                      e.target.style.background = 'rgba(255,255,255,0.1)';
                      e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                    }}
                  />
                </div>

                {/* Payment Method */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.9 }}>
                    Payment Method
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {['bank', 'card', 'cash', 'credit'].map((method) => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        style={{
                          padding: '0.75rem 0.625rem',
                          background: paymentMethod === method ? 'rgba(59, 130, 246, 0.8)' : 'rgba(255,255,255,0.08)',
                          color: 'white',
                          border: `1.5px solid ${paymentMethod === method ? 'rgba(59, 130, 246, 1)' : 'rgba(255,255,255,0.15)'}`,
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.25rem',
                          height: 'auto',
                          minHeight: '50px'
                        }}
                        onMouseEnter={(e) => {
                          if (paymentMethod !== method) {
                            e.target.style.background = 'rgba(255,255,255,0.12)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (paymentMethod !== method) {
                            e.target.style.background = 'rgba(255,255,255,0.08)';
                          }
                        }}
                      >
                        <span style={{ fontSize: '1.2rem' }}>
                          {method === 'bank' && '🏦'}
                          {method === 'card' && '💳'}
                          {method === 'cash' && '💵'}
                          {method === 'credit' && '📋'}
                        </span>
                        <span style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'capitalize' }}>
                          {method === 'bank' && 'Bank'}
                          {method === 'card' && 'Card'}
                          {method === 'cash' && 'Cash'}
                          {method === 'credit' && 'Cheque'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reference / Notes */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.9 }}>
                    Reference / Notes
                  </label>
                  <textarea
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.875rem',
                      background: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      border: '1.5px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                      fontWeight: '500',
                      minHeight: '75px',
                      resize: 'none',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Invoice #, check number, etc."
                    onFocus={(e) => {
                      e.target.style.background = 'rgba(255,255,255,0.15)';
                      e.target.style.borderColor = 'rgba(255,255,255,0.4)';
                    }}
                    onBlur={(e) => {
                      e.target.style.background = 'rgba(255,255,255,0.1)';
                      e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                    }}
                  />
                </div>

                {/* Confirm Button */}
                <button
                  onClick={handleConfirmPayment}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.3s',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                    letterSpacing: '0.3px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                  }}
                >
                  <span>✓</span>
                  <span>Confirm Payment</span>
                </button>
              </div>

              {/* Summary Card */}
              <div style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                borderRadius: '14px',
                padding: '1.5rem',
                color: 'white',
                boxShadow: '0 10px 30px rgba(59, 130, 246, 0.2)'
              }}>
                <div style={{ fontSize: '2.25rem', fontWeight: '700', marginBottom: '0.5rem', letterSpacing: '-1px' }}>
                  ${payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0).toFixed(2)}
                </div>
                <div style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.95 }}>
                  <span>📉</span>
                  <span>8% decrease from last month</span>
                </div>
              </div>
            </div>

            {/* Right Section - Payments History */}
            <div style={{ flex: 1 }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '1.5rem', gap: '3.5rem' }}>
                <div style={{ position: 'relative', width: '180px' }}>
                  <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}>
                    🔍
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search ID or Supplier..."
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
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
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
                  <option>Last 30 Days</option>
                  <option>Last 60 Days</option>
                  <option>Last 90 Days</option>
                  <option>All Time</option>
                </select>
                <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700', color: '#1e293b', marginLeft: 'auto' }}>
                  Payments History
                </h2>
              </div>

              {/* Table */}
              <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                      {['PAYMENT ID', 'SUPPLIER', 'AMOUNT', 'DATE', 'METHOD', 'STATUS'].map((header, idx) => (
                        <th
                          key={idx}
                          style={{
                            textAlign: 'left',
                            padding: '1rem',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            color: '#64748b',
                            textTransform: 'uppercase',
                            backgroundColor: '#f8fafc'
                          }}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPayments.length > 0 ? (
                      paginatedPayments.map((payment, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#3b82f6' }}>
                            #{payment.id}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>
                              {payment.supplier_name || payment.supplier || 'Unknown'}
                            </div>
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>
                            ${parseFloat(payment.amount).toFixed(2)}
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
                            {payment.date}
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span>{payment.method}</span>
                            </div>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              color: 'white',
                              background: getStatusColor(payment.status)
                            }}>
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                          No payments found. Try adjusting your filters or create a new payment.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: '#64748b' }}>
                  {filteredPayments.length > 0
                    ? `Showing ${((currentPage - 1) * itemsPerPage) + 1} to ${Math.min(currentPage * itemsPerPage, filteredPayments.length)} of ${filteredPayments.length} results`
                    : 'No results found'
                  }
                </span>
                <div style={{ display: 'flex', gap: '0.25rem', marginLeft: '1rem' }}>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      style={{
                        padding: '0.5rem 0.75rem',
                        background: currentPage === i + 1 ? '#3b82f6' : 'white',
                        color: currentPage === i + 1 ? 'white' : '#64748b',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '600'
                      }}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '2rem' }}>
                <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✓</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: '600' }}>
                    SUCCESSFUL
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>
                    $45,200
                  </div>
                </div>

                <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: '600' }}>
                    PROCESSING
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f97316' }}>
                    $3,150
                  </div>
                </div>

                <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📋</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: '600' }}>
                    TOTAL INVOICES
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3b82f6' }}>
                    124
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierPayment;
