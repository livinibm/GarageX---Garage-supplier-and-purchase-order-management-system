import React, { useState, useEffect } from 'react';
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

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const overviewRes = await api.get('/dashboard/overview/', withAuth());

        setDashboardData(overviewRes.data?.data);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);
  };

  return (
    <div className="page-wrapper">
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <h1>GarageX</h1>
          </div>

          <ul className="nav-menu">
            <li className="nav-menu-item">
              <a href="/dashboard" className="nav-menu-link active">Dashboard</a>
            </li>
            <li className="nav-menu-item">
              <a href="/supplier-payment" className="nav-menu-link">Supplier Payment</a>
            </li>
            <li className="nav-menu-item">
              <a href="/invoices" className="nav-menu-link">Invoice</a>
            </li>
            <li className="nav-menu-item">
              <a href="/reports" className="nav-menu-link">Reports</a>
            </li>
          </ul>

          <div className="navbar-actions">
            <NotificationBell buttonClass="navbar-icon-btn" dropdownWidth={400} />

            <div style={{ position: 'relative' }}>
              <button
                className="user-profile-btn"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              >
                <div className="user-profile-avatar">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              </button>
              {userDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.5rem',
                  width: '180px',
                  background: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  padding: '0.5rem 0',
                  zIndex: 100
                }}>
                  <button
                    onClick={onLogout}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '0.5rem 1rem',
                      textAlign: 'left',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      color: '#ef4444',
                      fontWeight: '600'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.target.style.background = 'white'}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="bi-main-content" style={{ padding: '2rem' }}>
        <h1>Supplier Dashboard</h1>
        <p>Welcome to your dashboard, {user?.name || 'User'}!</p>

        <div className="kpi-grid" style={{ marginTop: '2rem' }}>
          <div className="kpi-card">
            <div className="kpi-icon blue">📊</div>
            <div className="kpi-content">
              <div className="kpi-label">Total Spend</div>
              <div className="kpi-value">
                {formatCurrency(dashboardData?.payments?.total_amount)}
              </div>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon orange">🛒</div>
            <div className="kpi-content">
              <div className="kpi-label">Pending Invoices</div>
              <div className="kpi-value">
                {dashboardData?.invoices?.unpaid_amount ? formatCurrency(dashboardData.invoices.unpaid_amount) : '$0.00'}
              </div>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon green">💰</div>
            <div className="kpi-content">
              <div className="kpi-label">Overdue Invoices</div>
              <div className="kpi-value">
                {dashboardData?.invoices?.overdue_count || 0}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
