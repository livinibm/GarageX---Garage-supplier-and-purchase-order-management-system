import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/vendorDashboard/VendorDashboard.css';

const VendorDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1 className='logo-head'>VendorPulse</h1>
        <div className="user-info">
          {user?.role === 'ADMIN' && (
            <button className="nav-btn" onClick={() => navigate('/')}>← Admin Dashboard</button>
          )}
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="welcome-card">
          <h2>Welcome to VendorPulse</h2>
          <span className="user-welcome">
            {user?.first_name} {user?.last_name} ({user?.role})
          </span>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-icon" style={{fontSize: '40px'}}>📦</div>
            <h3>Catalog Items</h3>
            <p>Publish and maintain approved catalog entries</p>
            <button className="card-btn" onClick={() => navigate('/product-management')}>
              Manage Catalog
            </button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon" style={{fontSize: '40px'}}>🏢</div>
            <h3>Vendor Directory</h3>
            <p>Manage vendor profiles and activity status</p>
            <button className="card-btn" onClick={() => navigate('/vendor-management')}>
              Manage Vendors
            </button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon" style={{fontSize: '40px'}}>📈</div>
            <h3>Scorecards</h3>
            <p>Track reliability, delivery, and approval trends</p>
            <button className="card-btn" onClick={() => navigate('/scorecards')}>
                View Scorecards
            </button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon" style={{fontSize: '40px'}}>💳</div>
            <h3>Payments</h3>
            <p>Track settlements across vendor contracts</p>
            <button className="card-btn" onClick={() => navigate('/payments')}>
              View Payments
            </button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon" style={{fontSize: '40px'}}>🧾</div>
            <h3>Invoices</h3>
            <p>Review billing status and due dates</p>
            <button className="card-btn" onClick={() => navigate('/invoices')}>
              View Invoices
            </button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon" style={{fontSize: '40px'}}>📊</div>
            <h3>Insights</h3>
            <p>Understand spend, risk, and vendor health</p>
            <button className="card-btn" onClick={() => navigate('/reports')}>
              View Insights
            </button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon" style={{fontSize: '40px'}}>🔔</div>
            <h3>Alerts</h3>
            <p>Stay ahead of delays and critical risks</p>
            <button className="card-btn" onClick={() => navigate('/notifications')}>
              View Alerts
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VendorDashboard;
