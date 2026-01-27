import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import GarageDashboard from './components/GarageDashboard';
import SupplierDashboard from '../src/pages/supplierDashbord/SupplierDashboard';
import SupplierManagement from '../src/pages/supplierDashbord/SupplierManagement';
import ProductManagement from '../src/pages/supplierDashbord/ProductManagement';
// Banuka Start
import PurchaseOrderList from '../src/pages/supplierDashbord/PurchaseOrderList';
import CreatePurchaseOrder from '../src/pages/supplierDashbord/CreatePurchaseOrder';
import InventoryManagement from '../src/pages/garage/InventoryManagement';
// Banuka End
import './App.css';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: { 'Content-Type': 'application/json' }
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
        .then(response => setUser(response.data))
        .catch(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Login onLogin={(userData) => setUser(userData)} />;

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={
            user.role === 'SUPPLIER' ? <SupplierDashboard user={user} onLogout={handleLogout} /> :
              user.role === 'ADMIN' ? <AdminDashboard user={user} onLogout={handleLogout} /> :
                <GarageDashboard user={user} onLogout={handleLogout} />
          } />

          {/* New Routes for Management Pages */}
          <Route path="/supplier-management" element={<SupplierManagement />} />
          <Route path="/product-management" element={<ProductManagement />} />
          {/* Banuka Start */}
          <Route path="/purchase-orders" element={<PurchaseOrderList user={user} />} />
          <Route path="/purchase-orders/new" element={<CreatePurchaseOrder />} />
          <Route path="/inventory" element={<InventoryManagement user={user} />} />
          {/* Banuka End */}
         {/* Admin can access Garage and Supplier dashboards */}
         <Route path="/garage" element={<GarageDashboard user={user} onLogout={handleLogout} />} />
         <Route path="/supplier" element={<SupplierDashboard user={user} onLogout={handleLogout} />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;