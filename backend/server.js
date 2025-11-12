const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const redis = require('redis');

// Load environment variables from backend directory
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const prisma = new PrismaClient();

// Redis client setup with URL validation and cleaning
let redisClient;
(async () => {
  try {
    // Get Redis URL and clean it if it contains the key name
    let redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    // Remove 'REDIS_URL=' prefix if present (handles malformed env vars)
    if (redisUrl.startsWith('REDIS_URL=')) {
      redisUrl = redisUrl.replace('REDIS_URL=', '');
    }
    
    // Remove quotes if present
    redisUrl = redisUrl.trim().replace(/^["']|["']$/g, '');
    
    // Validate URL format
    if (!redisUrl.startsWith('redis://') && !redisUrl.startsWith('rediss://')) {
      console.warn('⚠️  Invalid Redis URL format. Using default: redis://localhost:6379');
      redisUrl = 'redis://localhost:6379';
    }
    
    console.log('🔗 Connecting to Redis...');
    redisClient = redis.createClient({
      url: redisUrl
    });
    
    redisClient.on('error', (err) => console.error('❌ Redis Client Error:', err.message));
    redisClient.on('connect', () => console.log('🔌 Redis connecting...'));
    redisClient.on('ready', () => console.log('✅ Redis connected and ready'));
    
    await redisClient.connect();
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error.message);
    console.log('⚠️  Continuing without Redis. Some features may be limited.');
    redisClient = null;
  }
})();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/auth');
const policeRoutes = require('./routes/police');
const userRoutes = require('./routes/user');
const trafficRoutes = require('./routes/traffic');
const notificationRoutes = require('./routes/notifications');
const geocodeRoutes = require('./routes/geocode');

app.use('/api/auth', authRoutes);
app.use('/api/police', policeRoutes);
app.use('/api/user', userRoutes);
app.use('/api/traffic', trafficRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/geocode', geocodeRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    redis: redisClient ? 'connected' : 'disconnected',
    database: 'connected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

// Initialize traffic monitoring cron jobs
const { initTrafficMonitoring } = require('./cron/trafficMonitor');

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  
  // Initialize cron jobs after Redis is connected
  setTimeout(async () => {
    try {
      if (redisClient) {
        // Check if Redis is connected
        await redisClient.ping();
        initTrafficMonitoring(redisClient);
      } else {
        console.warn('⚠️  Redis not available. Cron jobs will not run.');
      }
    } catch (error) {
      console.warn('⚠️  Redis not ready. Cron jobs will not run.');
    }
  }, 3000);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  if (redisClient) {
    await redisClient.quit();
  }
  process.exit(0);
});

module.exports = { app, prisma, redisClient };

