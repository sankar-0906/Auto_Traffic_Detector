const { PrismaClient } = require('@prisma/client');
const { detectRegionTraffic } = require('./trafficDetectionService');

const prisma = new PrismaClient();

/**
 * Create alert for traffic congestion
 */
const createAlert = async (alertData) => {
  try {
    const alert = await prisma.alert.create({
      data: {
        regionId: alertData.regionId,
        userId: alertData.userId || null,
        trafficLevel: alertData.trafficLevel,
        lengthKm: alertData.lengthKm,
        message: alertData.message,
        status: 'PENDING'
      },
      include: {
        region: {
          include: {
            police: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    // Create notification for the police officer
    if (alert.region.police) {
      await prisma.notification.create({
        data: {
          userId: alert.region.police.id,
          alertId: alert.id,
          message: alert.message || `Traffic alert: ${alert.lengthKm.toFixed(2)} km congestion detected`,
          type: 'TRAFFIC_ALERT'
        }
      });
    }

    return alert;
  } catch (error) {
    console.error('Error creating alert:', error);
    throw error;
  }
};

/**
 * Check for traffic alerts in all regions
 * Uses Redis to prevent duplicate alerts
 */
const checkAllRegions = async (redisClient) => {
  try {
    const regions = await prisma.region.findMany({
      include: {
        police: true
      }
    });

    const alerts = [];

    for (const region of regions) {
      // Check Redis cache to avoid duplicate alerts
      const cacheKey = `alert:${region.id}:${new Date().toISOString().slice(0, 16)}`; // Cache per minute
      let cached = null;
      
      // Only use Redis if available
      if (redisClient) {
        try {
          // Ping to check if Redis is connected
          await redisClient.ping();
          cached = await redisClient.get(cacheKey);
        } catch (redisError) {
          // Redis not available or error, continue without cache
          cached = null;
        }
      }

      if (cached) {
        continue; // Skip if already checked recently
      }

      // Detect traffic
      const trafficAlert = await detectRegionTraffic(region);

      if (trafficAlert) {
        // Check if similar alert already exists (within last 10 minutes)
        const recentAlert = await prisma.alert.findFirst({
          where: {
            regionId: region.id,
            status: 'PENDING',
            createdAt: {
              gte: new Date(Date.now() - 10 * 60 * 1000) // Last 10 minutes
            }
          }
        });

        if (!recentAlert) {
          const alert = await createAlert(trafficAlert);
          alerts.push(alert);

          // Cache for 5 minutes (only if Redis is available)
          if (redisClient) {
            try {
              await redisClient.setEx(cacheKey, 300, '1');
            } catch (redisError) {
              // Redis not available or error, continue without cache
            }
          }
        }
      }
    }

    return alerts;
  } catch (error) {
    console.error('Error checking regions:', error);
    throw error;
  }
};

/**
 * Resolve an alert
 */
const resolveAlert = async (alertId, userId) => {
  try {
    const alert = await prisma.alert.update({
      where: { id: alertId },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date()
      },
      include: {
        region: true
      }
    });

    return alert;
  } catch (error) {
    console.error('Error resolving alert:', error);
    throw error;
  }
};

/**
 * Get alerts for a user (police or regular user)
 */
const getUserAlerts = async (userId, role) => {
  try {
    let alerts;

    if (role === 'POLICE' || role === 'ADMIN') {
      // Get alerts for police's region
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { region: true }
      });

      if (user.region) {
        alerts = await prisma.alert.findMany({
          where: {
            regionId: user.region.id,
            status: 'PENDING'
          },
          include: {
            region: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        });
      } else {
        alerts = [];
      }
    } else {
      // Get alerts for regular user's routes
      alerts = await prisma.alert.findMany({
        where: {
          userId: userId,
          status: 'PENDING'
        },
        include: {
          region: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    }

    return alerts;
  } catch (error) {
    console.error('Error getting user alerts:', error);
    throw error;
  }
};

module.exports = {
  createAlert,
  checkAllRegions,
  resolveAlert,
  getUserAlerts
};

