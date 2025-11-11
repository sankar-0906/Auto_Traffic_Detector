/**
 * Main Server File
 * Entry point for the Express application
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const logger = require('./config/logger');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const trafficRoutes = require('./routes/trafficRoutes');
const routeRoutes = require('./routes/routeRoutes');
const policeRoutes = require('./routes/policeRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io available globally for services
app.set('io', io);
global.io = io;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/traffic', trafficRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/police', policeRoutes);
app.use('/api/notifications', notificationRoutes);

// Socket.io connection handling
io.use((socket, next) => {
  // Authentication middleware for Socket.io
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error'));
  }

  // Verify token (simplified - in production, use proper JWT verification)
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.userId;
  logger.info(`Socket connected: ${socket.id} for user ${userId}`);

  // Join user-specific room
  socket.join(`user:${userId}`);

  // Handle disconnection
  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });

  // Handle errors
  socket.on('error', (error) => {
    logger.error('Socket error:', error);
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Start traffic monitor job (if enabled)
if (process.env.ENABLE_TRAFFIC_MONITOR !== 'false') {
  const { startTrafficMonitor } = require('./jobs/trafficMonitor');
  startTrafficMonitor();
}

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

module.exports = { app, server, io };

