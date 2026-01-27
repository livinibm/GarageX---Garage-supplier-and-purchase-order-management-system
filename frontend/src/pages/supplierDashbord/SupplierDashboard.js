import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/supplierDashbord/SupplierDashboard.css';

const SupplierDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1 className='logo-head'>GarageX</h1>
        <div className="user-info">
          {user?.role === 'ADMIN' && (
            <button className="nav-btn" onClick={() => navigate('/')}>← Admin Dashboard</button>
          )}
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="welcome-card">
          <h2>Welcome to GarageX</h2>
          <span className="user-welcome">
            {user?.first_name} {user?.last_name} ({user?.role})
          </span>
        </div>

        <div className="dashboard-grid">
          {/* PRODUCT MANAGEMENT CARD */}
          <div className="dashboard-card">
            <div className="card-icon" style={{fontSize: '40px'}}>📦</div>
            <h3>My Products</h3>
            <p>Add and manage your spare parts inventory</p>
            {/* Navigates specifically to Product Management */}
            <button className="card-btn" onClick={() => navigate('/product-management')}>
                Manage Products
            </button>
          </div>

          {/* SUPPLIER MANAGEMENT CARD */}
          <div className="dashboard-card">
            <div className="card-icon" style={{fontSize: '40px'}}>🏢</div>
            <h3>Supplier Directory</h3>
            <p>View and manage supplier contact details</p>
            {/* Navigates specifically to Supplier Management */}
            <button className="card-btn" onClick={() => navigate('/supplier-management')}>
                Manage Suppliers
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SupplierDashboard;