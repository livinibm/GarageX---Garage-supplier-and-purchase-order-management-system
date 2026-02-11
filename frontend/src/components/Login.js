import React, { useState } from 'react';
import { apiClient } from '../api';
import './Login.css';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/api/token/', formData);
      const { access, refresh } = response.data;
      
      // Store tokens
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      // Get user info
      const userResponse = await apiClient.get('/api/accounts/user/', {
        headers: { Authorization: `Bearer ${access}` }
      });
      
      onLogin(userResponse.data);
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>VendorPulse Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          {error && <div className="error">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="test-accounts">
          <h4>Test Accounts:</h4>
          <p><strong>Admin:</strong> admin1 / Palanivel</p>
          <p><strong>Ops:</strong> ops1 / Operation123</p>
          <p><strong>Vendor:</strong> supplier1 / Vendor123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
