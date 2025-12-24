import React from 'react';
import './Dashboard.css';

const GarageDashboard = ({ user, onLogout }) => {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Garage Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user.first_name} {user.last_name} (Garage Staff)</span>
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
            <button className="card-btn">View Orders</button>
          </div>
          
          <div className="dashboard-card">
            <h3>Spare Parts</h3>
            <p>Browse available spare parts and inventory</p>
            <button className="card-btn">Browse Parts</button>
          </div>
          
          <div className="dashboard-card">
            <h3>Suppliers</h3>
            <p>View supplier information and contact details</p>
            <button className="card-btn">View Suppliers</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GarageDashboard;
