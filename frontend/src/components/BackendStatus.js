import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from '../services/api';

const BackendStatus = () => {
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState(null);
  const location = useLocation();

  // Don't show on login/register pages
  const hideOnPages = ['/login', '/register'];
  const shouldShow = !hideOnPages.includes(location.pathname);

  useEffect(() => {
    if (!shouldShow) {
      return;
    }

    const checkBackend = async () => {
      try {
        // Use absolute URL to avoid proxy issues
        const response = await axios.get('/health', {
          timeout: 3000,
          validateStatus: () => true // Don't throw on any status
        });
        
        if (response.status === 200 && response.data.status === 'OK') {
          setStatus('connected');
          setError(null);
        } else {
          setStatus('disconnected');
          setError('Backend returned unexpected status');
        }
      } catch (err) {
        setStatus('disconnected');
        if (err.code === 'ECONNREFUSED' || err.message?.includes('Network Error')) {
          setError('Cannot connect to backend server');
        } else {
          setError(err.message || 'Connection error');
        }
      }
    };

    checkBackend();
    // Check every 30 seconds (less frequent to avoid spam)
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, [shouldShow]);

  if (!shouldShow || status === 'connected') {
    return null; // Don't show anything if connected or on auth pages
  }

  return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">
            ⚠️ Backend server is not running
          </p>
          <p className="mt-2 text-sm">
            {error || 'Please start the backend server on port 5000'}
          </p>
          <p className="mt-1 text-xs text-red-600 font-mono">
            Run: <code className="bg-red-200 px-2 py-1 rounded">cd backend && npm run dev</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BackendStatus;

