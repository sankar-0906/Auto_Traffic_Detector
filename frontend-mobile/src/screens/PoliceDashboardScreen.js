/**
 * Police Dashboard Screen Component
 * Dashboard for traffic police users in React Native
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { logout } from '../store/authSlice';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import api from '../config/api';
import createSocket from '../config/socket';

const PoliceDashboardScreen = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [region, setRegion] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    initializeSocket();
    fetchRegion();
    fetchAlerts();
    fetchStats();
  }, []);

  const initializeSocket = async () => {
    try {
      const socketInstance = await createSocket();
      setSocket(socketInstance);

      socketInstance.on('traffic_alert', (data) => {
        setAlerts((prev) => [data.alert, ...prev]);
        Alert.alert('New Traffic Alert', data.notification.message);
      });

      socketInstance.on('alert_updated', (data) => {
        setAlerts((prev) =>
          prev.map((alert) =>
            alert.id === data.alert.id ? data.alert : alert
          )
        );
        fetchStats();
      });
    } catch (error) {
      console.error('Error initializing socket:', error);
    }
  };

  const fetchRegion = async () => {
    try {
      const response = await api.get('/police/region');
      const regionData = response.data.data.region;
      setRegion(regionData);
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
      Alert.alert('Error', 'Failed to update alert status');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigation.replace('Login');
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

  const mapRegion = selectedAlert
    ? {
        latitude: selectedAlert.startLat,
        longitude: selectedAlert.startLng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : region
    ? {
        latitude: region.centerLat,
        longitude: region.centerLng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : {
        latitude: 28.6139,
        longitude: 77.2090,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Traffic Police Dashboard</Text>
        <Text style={styles.headerSubtitle}>Welcome, {user?.name}</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {stats && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Alerts</Text>
              <Text style={styles.statValue}>{stats.total}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Pending</Text>
              <Text style={[styles.statValue, { color: '#ffc107' }]}>
                {stats.pending}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Resolved</Text>
              <Text style={[styles.statValue, { color: '#28a745' }]}>
                {stats.resolved}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Today</Text>
              <Text style={styles.statValue}>{stats.today}</Text>
            </View>
          </View>
        )}

        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={mapRegion}
            showsUserLocation
            showsTraffic
          >
            {alerts.map((alert) => (
              <Marker
                key={alert.id}
                coordinate={{
                  latitude: alert.startLat,
                  longitude: alert.startLng,
                }}
                pinColor={getSeverityColor(alert.severity)}
                onPress={() => setSelectedAlert(alert)}
              />
            ))}
          </MapView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Alerts</Text>
          {alerts.length === 0 ? (
            <Text style={styles.emptyText}>No active alerts</Text>
          ) : (
            alerts.map((alert) => (
              <View
                key={alert.id}
                style={[
                  styles.alertItem,
                  selectedAlert?.id === alert.id && styles.alertItemSelected,
                ]}
              >
                <View style={styles.alertHeader}>
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: getSeverityColor(alert.severity) },
                    ]}
                  >
                    <Text style={styles.badgeText}>{alert.severity}</Text>
                  </View>
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: getStatusColor(alert.status) },
                    ]}
                  >
                    <Text style={styles.badgeText}>{alert.status}</Text>
                  </View>
                </View>
                <Text style={styles.alertCongestion}>
                  {alert.congestionLength.toFixed(2)}km congestion
                </Text>
                <Text style={styles.alertLocation}>
                  {alert.startAddress ||
                    `${alert.startLat.toFixed(4)}, ${alert.startLng.toFixed(4)}`}
                </Text>
                <Text style={styles.alertTime}>
                  {new Date(alert.detectedAt).toLocaleString()}
                </Text>
                {alert.status === 'PENDING' && (
                  <View style={styles.alertActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() =>
                        handleUpdateStatus(alert.id, 'ACKNOWLEDGED')
                      }
                    >
                      <Text style={styles.actionButtonText}>Acknowledge</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.resolveButton]}
                      onPress={() => handleUpdateStatus(alert.id, 'RESOLVED')}
                    >
                      <Text style={styles.actionButtonText}>Resolve</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {alert.status === 'ACKNOWLEDGED' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.resolveButton]}
                    onPress={() => handleUpdateStatus(alert.id, 'RESOLVED')}
                  >
                    <Text style={styles.actionButtonText}>Resolve</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#667eea',
    padding: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 15,
  },
  logoutButton: {
    alignSelf: 'flex-end',
    padding: 8,
    paddingHorizontal: 16,
    backgroundColor: '#dc3545',
    borderRadius: 6,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    margin: 15,
    padding: 15,
    borderRadius: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  mapContainer: {
    height: 300,
    margin: 15,
    marginTop: 0,
    borderRadius: 10,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    margin: 15,
    marginTop: 0,
    padding: 15,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    padding: 20,
  },
  alertItem: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  alertItemSelected: {
    borderColor: '#667eea',
    backgroundColor: '#f0f4ff',
  },
  alertHeader: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  alertCongestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  alertLocation: {
    fontSize: 13,
    color: '#666',
    marginBottom: 5,
  },
  alertTime: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10,
  },
  alertActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#17a2b8',
    borderRadius: 6,
    alignItems: 'center',
  },
  resolveButton: {
    backgroundColor: '#28a745',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default PoliceDashboardScreen;

