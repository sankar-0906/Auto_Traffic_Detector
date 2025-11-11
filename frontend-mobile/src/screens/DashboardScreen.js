/**
 * Dashboard Screen Component
 * Main dashboard for React Native mobile app
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

const DashboardScreen = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [routes, setRoutes] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const [region, setRegion] = useState({
    latitude: 28.6139,
    longitude: 77.2090,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    if (user?.role === 'TRAFFIC_POLICE') {
      navigation.replace('PoliceDashboard');
    } else {
      fetchRoutes();
      fetchNotifications();
      initializeSocket();
    }
  }, [user, navigation]);

  const initializeSocket = async () => {
    try {
      const socketInstance = await createSocket();
      setSocket(socketInstance);

      socketInstance.on('traffic_alert', (data) => {
        setNotifications((prev) => [data.notification, ...prev]);
        Alert.alert('Traffic Alert', data.notification.message);
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
    } catch (error) {
      console.error('Error initializing socket:', error);
    }
  };

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
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Smart Traffic Detection</Text>
        <Text style={styles.headerSubtitle}>Welcome, {user?.name}</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={region}
            onRegionChangeComplete={setRegion}
            showsUserLocation
            showsTraffic
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Routes</Text>
          {routes.length === 0 ? (
            <Text style={styles.emptyText}>No routes saved</Text>
          ) : (
            routes.map((route) => (
              <View key={route.id} style={styles.routeItem}>
                <Text style={styles.routeName}>{route.name}</Text>
                <Text style={styles.routePath}>
                  {route.originName} → {route.destName}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          {notifications.length === 0 ? (
            <Text style={styles.emptyText}>No notifications</Text>
          ) : (
            notifications.slice(0, 5).map((notification) => (
              <View key={notification.id} style={styles.notificationItem}>
                <Text style={styles.notificationTitle}>
                  {notification.title}
                </Text>
                <Text style={styles.notificationMessage}>
                  {notification.message}
                </Text>
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
  mapContainer: {
    height: 300,
    margin: 15,
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
  routeItem: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  routePath: {
    fontSize: 14,
    color: '#666',
  },
  notificationItem: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#667eea',
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  notificationMessage: {
    fontSize: 12,
    color: '#666',
  },
});

export default DashboardScreen;

