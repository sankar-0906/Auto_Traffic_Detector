/**
 * Redis configuration for caching and message broker
 */


// Create Redis client
const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL || `redis://${process.env.REDIS_PASSWORD ? `default:${process.env.REDIS_PASSWORD}@` : ''}${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`;

const redis = new Redis(redisUrl, {
  retryStrategy: (times) => Math.min(times * 50, 2000),
  maxRetriesPerRequest: 3,
});


// Error handling
redis.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redis.on('connect', () => {
  console.log('Redis Client Connected');
});

// Helper functions for caching
const cache = {
  /**
   * Get value from cache
   */
  async get(key) {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  },

  /**
   * Set value in cache with expiration
   */
  async set(key, value, expirationInSeconds = 3600) {
    try {
      await redis.setex(key, expirationInSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  },

  /**
   * Delete key from cache
   */
  async del(key) {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error('Redis DEL error:', error);
      return false;
    }
  },

  /**
   * Check if key exists
   */
  async exists(key) {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  },
};

module.exports = { redis, cache };

