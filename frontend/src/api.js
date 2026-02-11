import axios from 'axios';

const rawBase = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';
export const apiBase = rawBase.replace(/\/+$/, '');

export const apiClient = axios.create({
  baseURL: apiBase,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && !config.headers?.Authorization) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`
    };
  }
  return config;
});

export const apiFetch = (path, options = {}) => {
  const token = localStorage.getItem('access_token');
  const url = path.startsWith('http') ? path : `${apiBase}${path}`;
  const headers = {
    ...(options.headers || {})
  };
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  return fetch(url, { ...options, headers });
};
