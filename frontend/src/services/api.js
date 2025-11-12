import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Set default config
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.timeout = 10000; // 10 second timeout

// Add request interceptor to include token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle connection errors (backend not running)
    if (error.code === 'ECONNREFUSED' || error.message === 'Network Error') {
      console.error('❌ Cannot connect to backend server. Make sure the backend is running on port 5000.');
      // Don't redirect on connection errors, just show a user-friendly message
      if (error.config?.url && !error.config.url.includes('/health')) {
        // You can show a toast/notification here if you have one
        return Promise.reject({
          ...error,
          message: 'Backend server is not running. Please start the backend server.',
          isConnectionError: true
        });
      }
    }
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axios;

