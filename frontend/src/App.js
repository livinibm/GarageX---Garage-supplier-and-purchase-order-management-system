import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { apiClient } from './api';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import OpsDashboard from './components/OpsDashboard';
import VendorDashboard from '../src/pages/vendorDashboard/VendorDashboard';
import VendorManagement from '../src/pages/vendorDashboard/VendorManagement';
import ProductManagement from '../src/pages/vendorDashboard/ProductManagement';
import PaymentList from './components/PaymentList';
import InvoiceList from './components/InvoiceList';
import ReportDashboard from './components/ReportDashboard';
import NotificationList from './components/NotificationList';
import VendorScorecard from './pages/scorecard/VendorScorecard';
import PurchaseOrderList from '../src/pages/vendorDashboard/PurchaseOrderList';
import CreatePurchaseOrder from '../src/pages/vendorDashboard/CreatePurchaseOrder';
import InventoryManagement from '../src/pages/operations/InventoryManagement';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      apiClient.get('/api/accounts/user/')
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
            user.role === 'SUPPLIER' ? <VendorDashboard user={user} onLogout={handleLogout} /> :
              user.role === 'ADMIN' ? <AdminDashboard user={user} onLogout={handleLogout} /> :
                <OpsDashboard user={user} onLogout={handleLogout} />
          } />

          {/* New Routes for Management Pages */}
          <Route path="/vendor-management" element={<VendorManagement />} />
          <Route path="/product-management" element={<ProductManagement />} />
          <Route path="/purchase-orders" element={<PurchaseOrderList user={user} />} />
          <Route path="/purchase-orders/new" element={<CreatePurchaseOrder />} />
          <Route path="/inventory" element={<InventoryManagement user={user} />} />
         {/* Admin can access Ops and Vendor dashboards */}
         <Route path="/operations" element={<OpsDashboard user={user} onLogout={handleLogout} />} />
         <Route path="/vendor" element={<VendorDashboard user={user} onLogout={handleLogout} />} />

          <Route path="/payments" element={<PaymentList />} />
          <Route path="/invoices" element={<InvoiceList />} />
          <Route path="/reports" element={<ReportDashboard />} />
          <Route path="/notifications" element={<NotificationList />} />
          <Route path="/scorecards" element={<VendorScorecard />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;