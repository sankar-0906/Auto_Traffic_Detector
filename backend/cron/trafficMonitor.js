const cron = require('node-cron');
const { checkAllRegions } = require('../services/alertService');
const { PrismaClient } = require('@prisma/client');
const { detectRouteTraffic } = require('../services/trafficDetectionService');

const prisma = new PrismaClient();

// Initialize Redis client (import from server.js)
let redisClient;

/**
 * Initialize traffic monitoring cron jobs
 */
const initTrafficMonitoring = (redis) => {
  if (!redis) {
    console.warn('⚠️  Redis client not available. Traffic monitoring disabled.');
    return;
  }
  
  redisClient = redis;

  // Check all police regions every 2-3 minutes
  cron.schedule('*/2 * * * *', async () => {
    if (!redisClient) {
      console.warn('⚠️  Redis not available. Skipping traffic check.');
      return;
    }
    console.log('🔍 Checking traffic for all regions...');
    try {
      const alerts = await checkAllRegions(redisClient);
      if (alerts.length > 0) {
        console.log(`⚠️  Generated ${alerts.length} new traffic alerts`);
      }
    } catch (error) {
      console.error('Error in traffic monitoring cron:', error);
    }
  });

  // Check daily user routes every 5 minutes (only during their alert time windows)
  cron.schedule('*/5 * * * *', async () => {
    console.log('🔍 Checking daily user routes...');
    try {
      const dailyRoutes = await prisma.route.findMany({
        where: {
          isDaily: true,
          alertTimeStart: { not: null },
          alertTimeEnd: { not: null }
        },
        include: {
          user: true
        }
      });

      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      for (const route of dailyRoutes) {
        // Check if current time is within alert window
        if (route.alertTimeStart && route.alertTimeEnd) {
          if (currentTime >= route.alertTimeStart && currentTime <= route.alertTimeEnd) {
            // Check traffic for this route
            const trafficData = await detectRouteTraffic(route);

            if (trafficData.hasTraffic && trafficData.congestionKm > 0.5) {
              // Create notification for user
              await prisma.notification.create({
                data: {
                  userId: route.userId,
                  message: `Traffic alert on your daily route: ${trafficData.congestionKm.toFixed(2)} km congestion detected`,
                  type: 'ROUTE_UPDATE'
                }
              });

              console.log(`📢 Alert sent to user ${route.userId} for route ${route.id}`);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in daily route monitoring cron:', error);
    }
  });

  console.log('✅ Traffic monitoring cron jobs initialized');
};

module.exports = { initTrafficMonitoring };

