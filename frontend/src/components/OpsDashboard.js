import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const OpsDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <div className="dashboard" style={{ background: 'var(--gray-100)', minHeight: '100vh' }}>
      <header className="dashboard-header" style={{
        padding: '1.25rem 2rem',
        background: 'var(--white)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
      }}>
        <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: '700', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>VendorPulse Ops</h1>
        <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {user.role === 'ADMIN' && (
            <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => navigate('/')}
            >
              ← Admin
            </button>
          )}
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{user.first_name} {user.last_name}</span>
          <button style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', backgroundColor: 'var(--primary-blue)', color: 'white', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }} onClick={onLogout}>Logout</button>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="welcome-card">
          <h2>Welcome to VendorPulse</h2>
          <p>Track vendor performance and keep orders on schedule.</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Orders</h3>
            <p>Review approvals, deliveries, and vendor timelines</p>
            <button className="card-btn" onClick={() => navigate('/purchase-orders')}>View Orders</button>
          </div>

          <div className="dashboard-card">
            <h3>Catalog</h3>
            <p>Manage approved items across vendors</p>
            <button className="card-btn" onClick={() => navigate('/product-management')}>View Catalog</button>
          </div>

          <div className="dashboard-card">
            <h3>Stock Health</h3>
            <p>Monitor low stock and replenishment risk</p>
            <button className="card-btn" onClick={() => navigate('/inventory')}>Check Stock</button>
          </div>

          <div className="dashboard-card">
            <h3>Vendors</h3>
            <p>View vendor scorecards and contact details</p>
            <button className="card-btn" onClick={() => navigate('/vendor-management')}>View Vendors</button>
          </div>

          <div className="dashboard-card">
            <h3>Scorecards</h3>
            <p>See reliability trends and risk signals</p>
            <button className="card-btn" onClick={() => navigate('/scorecards')}>View Scorecards</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OpsDashboard;
