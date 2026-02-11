import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api';
import './Dashboard.css';

const AdminDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [showActivityLogs, setShowActivityLogs] = useState(false);

  // Navigate to other dashboards
  const navigateToOpsDashboard = () => {
    navigate('/operations');
  };

  const navigateToSupplierDashboard = () => {
    navigate('/vendor');
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

  const formatRole = (role) => role || 'USER';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/api/accounts/admin/users/');
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
      const response = await apiClient.get('/api/accounts/admin/activity-logs/');
      setActivityLogs(response.data.data);
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      await apiClient.patch(`/api/accounts/admin/users/${userId}/toggle/`);
      setSuccess('User status updated successfully!');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const resetPassword = async (userId) => {
    try {
      await apiClient.post(`/api/accounts/admin/users/${userId}/reset-password/`, passwordData);
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
      await apiClient.post('/api/accounts/admin/users/', formData);
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
        <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: '700', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>VendorPulse Admin</h1>
        <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
            {user.first_name} {user.last_name}
          </span>
          <button style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', backgroundColor: 'var(--primary-blue)', color: 'white', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }} onClick={onLogout}>Logout</button>
        </div>
      </header>

      {/* Navigation to other dashboards */}
      <nav className="dashboard-nav" style={{
        background: 'var(--white)',
        padding: '0.75rem 2rem',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div className="nav-links" style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="nav-btn active" onClick={() => { }}>
            Access Control
          </button>
          <button className="nav-btn" onClick={navigateToOpsDashboard}>
            Operations
          </button>
          <button className="nav-btn" onClick={navigateToSupplierDashboard}>
            Vendors
          </button>
          <button className="nav-btn" onClick={navigateToInventory}>
            Catalog
          </button>
          <button className="nav-btn" onClick={() => navigate('/scorecards')}>
            Scorecards
          </button>
        </div>
        <div className="nav-info" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
          🔐 Admin Access
        </div>
      </nav>

      <main className="dashboard-content">
        <div className="actions">
          <button
            className="create-btn"
            onClick={() => setShowCreateForm(true)}
          >
            Create User
          </button>
          <button
            className="logs-btn"
            onClick={openActivityLogs}
          >
            View Audit Log
          </button>
        </div>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        {showCreateForm && (
          <div className="modal">
            <div className="modal-content">
              <h3>Create User</h3>
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
                    <option value="SUPPLIER">Vendor</option>
                    <option value="OPS">Ops Manager</option>
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
          <h2>Team Directory</h2>
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
                    <span className={`role-badge ${formatRole(user.role).toLowerCase()}`}>
                      {formatRole(user.role)}
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
              <h3>Audit Log</h3>
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
