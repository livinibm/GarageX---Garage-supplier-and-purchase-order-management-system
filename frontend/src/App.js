import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import GarageDashboard from './components/GarageDashboard';
import Dashboard from '../src/pages/supplierDashbord/Dashboard';
import SupplierPayment from '../src/pages/supplierDashbord/SupplierPayment';
import InvoiceManagement from '../src/pages/supplierDashbord/InvoiceManagement';
import Reports from '../src/pages/supplierDashbord/Reports';
import ProductManagement from '../src/pages/supplierDashbord/ProductManagement';
import './App.css';

// Configure axios to use the backend URL
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  }
});

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      api.get('/api/accounts/user/', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => {
          setUser(response.data);
        })
        .catch(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'ADMIN':
        return <AdminDashboard user={user} onLogout={handleLogout} />;
      case 'GARAGE':
        return <GarageDashboard user={user} onLogout={handleLogout} />;
      case 'SUPPLIER':
        return <Dashboard user={user} onLogout={handleLogout} />;
      default:
        return <div>Invalid user role</div>;
    }
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={renderDashboard()} />
          <Route path="/dashboard" element={user.role === 'SUPPLIER' ? <Dashboard user={user} onLogout={handleLogout} /> : renderDashboard()} />
          <Route path="/supplier-payment" element={user.role === 'SUPPLIER' ? <SupplierPayment user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
          <Route path="/invoices" element={user.role === 'SUPPLIER' ? <InvoiceManagement user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
          <Route path="/products" element={user.role === 'SUPPLIER' ? <ProductManagement user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
          <Route path="/reports" element={user.role === 'SUPPLIER' ? <Reports user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
          {/* Admin can access all dashboards */}
          {user.role === 'ADMIN' && (
            <>
              <Route path="/garage" element={<GarageDashboard user={user} onLogout={handleLogout} />} />
            </>
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
