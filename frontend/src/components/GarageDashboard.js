import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const GarageDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Garage Dashboard</h1>
        <div className="user-info">
          {user.role === 'ADMIN' && (
            <button className="nav-btn" onClick={() => navigate('/')}>
              ← Admin Dashboard
            </button>
          )}
          <span>Welcome, {user.first_name} {user.last_name} ({user.role === 'ADMIN' ? 'Admin' : 'Garage Staff'})</span>
          <button onClick={onLogout}>Logout</button>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="welcome-card">
          <h2>Welcome to GarageX</h2>
          <p>Manage your garage operations and purchase orders.</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Purchase Orders</h3>
            <p>View and manage purchase orders from suppliers</p>
            {/* Banuka Start */}
            <button className="card-btn" onClick={() => navigate('/purchase-orders')}>View Orders</button>
            {/* Banuka End */}
          </div>

          <div className="dashboard-card">
            <h3>Spare Parts</h3>
            <p>Browse available spare parts and inventory</p>
            <button className="card-btn" onClick={() => navigate('/product-management')}>Browse Parts</button>
          </div>

          <div className="dashboard-card">
            <h3>Inventory</h3>
            <p>View current stock levels and spare parts inventory</p>
            <button className="card-btn" onClick={() => navigate('/inventory')}>View Inventory</button>
          </div>

          <div className="dashboard-card">
            <h3>Suppliers</h3>
            <p>View supplier information and contact details</p>
            <button className="card-btn" onClick={() => navigate('/supplier-management')}>View Suppliers</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GarageDashboard;
