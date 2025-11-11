/**
 * Socket.io Configuration for React Native
 * Real-time communication setup
 */

import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = process.env.SOCKET_URL || 'http://localhost:5000';

// Create socket instance
const createSocket = async () => {
  const token = await AsyncStorage.getItem('accessToken');
  
  return io(SOCKET_URL, {
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });
};

export default createSocket;

