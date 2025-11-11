/**
 * Police Dashboard Component
 * Dashboard for traffic police users
 */

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/authSlice';
import TrafficMap from '../Map/TrafficMap';
import api from '../../config/api';
import createSocket from '../../config/socket';
import './PoliceDashboard.css';

const PoliceDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [region, setRegion] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const token = localStorage.getItem('accessToken');
    if (token) {
      const socketInstance = createSocket(token);
      setSocket(socketInstance);

      socketInstance.on('traffic_alert', (data) => {
        setAlerts((prev) => [data.alert, ...prev]);
      });

      socketInstance.on('alert_updated', (data) => {
        setAlerts((prev) =>
          prev.map((alert) =>
            alert.id === data.alert.id ? data.alert : alert
          )
        );
      });

      return () => {
        socketInstance.disconnect();
      };
    }
  }, []);

  useEffect(() => {
    fetchRegion();
    fetchAlerts();
    fetchStats();
  }, []);

  const fetchRegion = async () => {
    try {
      const response = await api.get('/police/region');
      setRegion(response.data.data.region);
    } catch (error) {
      console.error('Error fetching region:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await api.get('/police/alerts', {
        params: { limit: 50 },
      });
      setAlerts(response.data.data.alerts || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/police/stats');
      setStats(response.data.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleUpdateStatus = async (alertId, status, notes = '') => {
    try {
      await api.put(`/police/alerts/${alertId}/status`, { status, notes });
      fetchAlerts();
      fetchStats();
    } catch (error) {
      console.error('Error updating alert status:', error);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return '#ffc107';
      case 'ACKNOWLEDGED':
        return '#17a2b8';
      case 'RESOLVED':
        return '#28a745';
      case 'IGNORED':
        return '#6c757d';
      default:
        return '#333';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return '#dc3545';
      case 'HIGH':
        return '#fd7e14';
      case 'MEDIUM':
        return '#ffc107';
      default:
        return '#28a745';
    }
  };

  return (
    <div className="police-dashboard">
      <header className="dashboard-header">
        <h1>Traffic Police Dashboard</h1>
        <div className="header-actions">
          <span className="user-name">Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </header>

      <div className="police-content">
        <div className="police-sidebar">
          {stats && (
            <div className="stats-section">
              <h2>Statistics</h2>
              <div className="stat-item">
                <span className="stat-label">Total Alerts</span>
                <span className="stat-value">{stats.total}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Pending</span>
                <span className="stat-value pending">{stats.pending}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Resolved</span>
                <span className="stat-value resolved">{stats.resolved}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Today</span>
                <span className="stat-value">{stats.today}</span>
              </div>
            </div>
          )}

          <div className="alerts-section">
            <h2>Active Alerts</h2>
            {alerts.length === 0 ? (
              <p>No active alerts</p>
            ) : (
              <div className="alerts-list">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`alert-item ${selectedAlert?.id === alert.id ? 'selected' : ''}`}
                    onClick={() => setSelectedAlert(alert)}
                  >
                    <div className="alert-header">
                      <span
                        className="severity-badge"
                        style={{ backgroundColor: getSeverityColor(alert.severity) }}
                      >
                        {alert.severity}
                      </span>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(alert.status) }}
                      >
                        {alert.status}
                      </span>
                    </div>
                    <div className="alert-body">
                      <p className="alert-congestion">
                        {alert.congestionLength.toFixed(2)}km congestion
                      </p>
                      <p className="alert-location">
                        {alert.startAddress || `${alert.startLat}, ${alert.startLng}`}
                      </p>
                      <p className="alert-time">
                        {new Date(alert.detectedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="alert-actions">
                      {alert.status === 'PENDING' && (
                        <>
                          <button
                            className="btn-acknowledge"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(alert.id, 'ACKNOWLEDGED');
                            }}
                          >
                            Acknowledge
                          </button>
                          <button
                            className="btn-resolve"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(alert.id, 'RESOLVED');
                            }}
                          >
                            Resolve
                          </button>
                        </>
                      )}
                      {alert.status === 'ACKNOWLEDGED' && (
                        <button
                          className="btn-resolve"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(alert.id, 'RESOLVED');
                          }}
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="police-main">
          <TrafficMap
            origin={
              selectedAlert
                ? { lat: selectedAlert.startLat, lng: selectedAlert.startLng }
                : region
                ? { lat: region.centerLat, lng: region.centerLng }
                : null
            }
            destination={
              selectedAlert
                ? { lat: selectedAlert.endLat, lng: selectedAlert.endLng }
                : null
            }
          />
        </div>
      </div>
    </div>
  );
};

export default PoliceDashboard;

