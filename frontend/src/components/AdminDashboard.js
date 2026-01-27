import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

// Configure axios to use the backend URL
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  }
});

const AdminDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [showActivityLogs, setShowActivityLogs] = useState(false);

  // Navigate to other dashboards
  const navigateToGarageDashboard = () => {
    navigate('/garage');
  };

  const navigateToSupplierDashboard = () => {
    navigate('/supplier');
  };

  const navigateToInventory = () => {
    navigate('/inventory');
  };
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'SUPPLIER'
  });
  const [passwordData, setPasswordData] = useState({
    new_password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await api.get('/api/accounts/admin/users/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const fetchActivityLogs = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await api.get('/api/accounts/admin/activity-logs/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActivityLogs(response.data.data);
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      const token = localStorage.getItem('access_token');
      await api.patch(`/api/accounts/admin/users/${userId}/toggle/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('User status updated successfully!');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const resetPassword = async (userId) => {
    try {
      const token = localStorage.getItem('access_token');
      await api.post(`/api/accounts/admin/users/${userId}/reset-password/`, passwordData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Password reset successfully!');
      setShowPasswordReset(false);
      setPasswordData({ new_password: '' });
      setSelectedUser(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    }
  };

  const openPasswordReset = (user) => {
    setSelectedUser(user);
    setShowPasswordReset(true);
  };

  const openActivityLogs = () => {
    setShowActivityLogs(true);
    fetchActivityLogs();
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('access_token');
      await api.post('/api/accounts/admin/users/', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('User created successfully!');
      setShowCreateForm(false);
      setFormData({
        username: '',
        password: '',
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        role: 'SUPPLIER'
      });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create user');
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user.first_name} {user.last_name} (Admin)</span>
          <button onClick={onLogout}>Logout</button>
        </div>
      </header>

      {/* Navigation to other dashboards */}
      <nav className="dashboard-nav">
        <div className="nav-links">
          <button className="nav-btn active" onClick={() => {}}>
            <i className="icon">👤</i>
            User Management
          </button>
          <button className="nav-btn" onClick={navigateToGarageDashboard}>
            <i className="icon">🔧</i>
            Garage Dashboard
          </button>
          <button className="nav-btn" onClick={navigateToSupplierDashboard}>
            <i className="icon">📦</i>
            Supplier Dashboard
          </button>
          <button className="nav-btn" onClick={navigateToInventory}>
            <i className="icon">📋</i>
            Inventory Management
          </button>
        </div>
        <div className="nav-info">
          <span>🔐 Admin Access: All Dashboards</span>
        </div>
      </nav>

      <main className="dashboard-content">
        <div className="actions">
          <button 
            className="create-btn"
            onClick={() => setShowCreateForm(true)}
          >
            Create New User
          </button>
          <button 
            className="logs-btn"
            onClick={openActivityLogs}
          >
            View Activity Logs
          </button>
        </div>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        {showCreateForm && (
          <div className="modal">
            <div className="modal-content">
              <h3>Create New User</h3>
              <form onSubmit={handleCreateUser}>
                <div className="form-row">
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-row">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  <input
                    type="text"
                    name="phone"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-row">
                  <input
                    type="text"
                    name="first_name"
                    placeholder="First Name"
                    value={formData.first_name}
                    onChange={handleChange}
                  />
                  <input
                    type="text"
                    name="last_name"
                    placeholder="Last Name"
                    value={formData.last_name}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-row">
                  <select name="role" value={formData.role} onChange={handleChange}>
                    <option value="SUPPLIER">Supplier</option>
                    <option value="GARAGE">Garage Staff</option>
                  </select>
                </div>
                <div className="form-actions">
                  <button type="submit">Create User</button>
                  <button type="button" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="users-table">
          <h2>Users</h2>
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.first_name} {user.last_name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone || '-'}</td>
                  <td>
                    <span className={`role-badge ${user.role.toLowerCase()}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className={`toggle-btn ${user.is_active ? 'deactivate' : 'activate'}`}
                        onClick={() => toggleUserStatus(user.id)}
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button 
                        className="reset-btn"
                        onClick={() => openPasswordReset(user)}
                      >
                        Reset Password
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Password Reset Modal */}
        {showPasswordReset && selectedUser && (
          <div className="modal">
            <div className="modal-content">
              <h3>Reset Password for {selectedUser.username}</h3>
              <form onSubmit={(e) => { e.preventDefault(); resetPassword(selectedUser.id); }}>
                <div className="form-row">
                  <input
                    type="password"
                    name="new_password"
                    placeholder="New Password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    required
                    minLength="8"
                  />
                </div>
                <div className="form-actions">
                  <button type="submit">Reset Password</button>
                  <button type="button" onClick={() => setShowPasswordReset(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Activity Logs Modal */}
        {showActivityLogs && (
          <div className="modal">
            <div className="modal-content large">
              <h3>Activity Logs</h3>
              <div className="logs-container">
                {activityLogs.length > 0 ? (
                  <table className="logs-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Action</th>
                        <th>IP Address</th>
                        <th>Timestamp</th>
                        <th>Success</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activityLogs.map(log => (
                        <tr key={log.id}>
                          <td>{log.user ? log.user.username : 'N/A'}</td>
                          <td>{log.action}</td>
                          <td>{log.ip_address}</td>
                          <td>{new Date(log.timestamp).toLocaleString()}</td>
                          <td>
                            <span className={`status-badge ${log.success ? 'active' : 'inactive'}`}>
                              {log.success ? 'Success' : 'Failed'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No activity logs found.</p>
                )}
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowActivityLogs(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
