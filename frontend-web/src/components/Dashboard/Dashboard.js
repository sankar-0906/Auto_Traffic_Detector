/**
 * Dashboard Component
 * Main dashboard for users
 */

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/authSlice';
import TrafficMap from '../Map/TrafficMap';
import api from '../../config/api';
import createSocket from '../../config/socket';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const token = localStorage.getItem('accessToken');
    if (token) {
      const socketInstance = createSocket(token);
      setSocket(socketInstance);

      socketInstance.on('traffic_alert', (data) => {
        setNotifications((prev) => [data.notification, ...prev]);
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      return () => {
        socketInstance.disconnect();
      };
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'TRAFFIC_POLICE') {
      navigate('/police');
    } else {
      fetchRoutes();
      fetchNotifications();
    }
  }, [user, navigate]);

  const fetchRoutes = async () => {
    try {
      const response = await api.get('/routes');
      setRoutes(response.data.data.routes || []);
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications', {
        params: { limit: 10 },
      });
      setNotifications(response.data.data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleTrafficDetected = (congestionData) => {
    console.log('Traffic detected:', congestionData);
    // Show alert or notification
    alert(`Traffic congestion detected: ${congestionData.congestionLength.toFixed(2)}km`);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Smart Traffic Detection</h1>
        <div className="header-actions">
          <span className="user-name">Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="dashboard-sidebar">
          <h2>Quick Actions</h2>
          <button
            className="btn-action"
            onClick={() => {
              // Get user's current location
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  setOrigin({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                  });
                },
                (error) => {
                  console.error('Error getting location:', error);
                }
              );
            }}
          >
            Use Current Location
          </button>

          <div className="routes-section">
            <h3>My Routes</h3>
            {routes.length === 0 ? (
              <p>No routes saved</p>
            ) : (
              routes.map((route) => (
                <div key={route.id} className="route-item">
                  <h4>{route.name}</h4>
                  <p>
                    {route.originName} → {route.destName}
                  </p>
                  <button
                    className="btn-small"
                    onClick={() => {
                      setOrigin({ lat: route.originLat, lng: route.originLng });
                      setDestination({ lat: route.destLat, lng: route.destLng });
                    }}
                  >
                    View on Map
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="notifications-section">
            <h3>Notifications</h3>
            {notifications.length === 0 ? (
              <p>No notifications</p>
            ) : (
              notifications.slice(0, 5).map((notification) => (
                <div key={notification.id} className="notification-item">
                  <strong>{notification.title}</strong>
                  <p>{notification.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="dashboard-main">
          <TrafficMap
            origin={origin}
            destination={destination}
            onTrafficDetected={handleTrafficDetected}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

