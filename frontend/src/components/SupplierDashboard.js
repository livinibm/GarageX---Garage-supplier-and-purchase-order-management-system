import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const SupplierDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Supplier Dashboard</h1>
        <div className="user-info">
          {user.role === 'ADMIN' && (
            <button className="nav-btn" onClick={() => navigate('/')}>
              ← Admin Dashboard
            </button>
          )}
          <span>Welcome, {user.first_name} {user.last_name} ({user.role === 'ADMIN' ? 'Admin' : 'Supplier'})</span>
          <button onClick={onLogout}>Logout</button>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="welcome-card">
          <h2>Welcome to GarageX</h2>
          <p>Manage your spare parts catalog and purchase orders.</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>My Products</h3>
            <p>Add and manage your spare parts inventory</p>
            <button className="card-btn">Manage Products</button>
          </div>
          
          <div className="dashboard-card">
            <h3>Purchase Orders</h3>
            <p>View orders from garages and manage fulfillment</p>
            <button className="card-btn">View Orders</button>
          </div>
          
          <div className="dashboard-card">
            <h3>Analytics</h3>
            <p>View sales reports and performance metrics</p>
            <button className="card-btn">View Analytics</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SupplierDashboard;
