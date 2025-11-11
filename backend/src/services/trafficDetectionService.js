/**
 * Traffic Detection Service
 * Handles traffic detection logic and alert generation
 */

const prisma = require('../config/database');
const logger = require('../config/logger');
const googleMapsService = require('./googleMapsService');
const { cache } = require('../config/redis');

// Get io instance dynamically to avoid circular dependency
const getIO = () => {
  return global.io;
};

class TrafficDetectionService {
  /**
   * Detect traffic congestion for a route
   */
  async detectTraffic(origin, destination, userId = null, routeId = null) {
    try {
      // Check cache first
      const cacheKey = `traffic:${origin.lat}:${origin.lng}:${destination.lat}:${destination.lng}`;
      const cachedData = await cache.get(cacheKey);

      if (cachedData) {
        logger.info('Traffic data retrieved from cache');
        return cachedData;
      }

      // Get directions from Google Maps
      const directionsData = await googleMapsService.getDirections(origin, destination);

      // Analyze traffic congestion
      const congestionData = googleMapsService.analyzeTrafficCongestion(directionsData);

      // Find route with highest congestion
      const worstRoute = congestionData.reduce((prev, current) =>
        current.congestionLength > prev.congestionLength ? current : prev
      );

      // Check if congestion exceeds 1km threshold
      if (worstRoute.congestionLength > 1.0) {
        // Get addresses
        const startAddress = await googleMapsService.reverseGeocode(
          worstRoute.congestedSegments[0]?.startLocation?.lat || origin.lat,
          worstRoute.congestedSegments[0]?.startLocation?.lng || origin.lng
        );
        const endAddress = await googleMapsService.reverseGeocode(
          worstRoute.congestedSegments[worstRoute.congestedSegments.length - 1]?.endLocation
            ?.lat || destination.lat,
          worstRoute.congestedSegments[worstRoute.congestedSegments.length - 1]?.endLocation
            ?.lng || destination.lng
        );

        // Determine severity
        let severity = 'LOW';
        if (worstRoute.congestionLength > 5) {
          severity = 'CRITICAL';
        } else if (worstRoute.congestionLength > 3) {
          severity = 'HIGH';
        } else if (worstRoute.congestionLength > 1.5) {
          severity = 'MEDIUM';
        }

        // Find nearest police region
        const policeRegion = await this.findNearestPoliceRegion(
          worstRoute.congestedSegments[0]?.startLocation?.lat || origin.lat,
          worstRoute.congestedSegments[0]?.startLocation?.lng || origin.lng
        );

        // Create traffic alert
        const alert = await prisma.trafficAlert.create({
          data: {
            routeId,
            userId,
            policeRegionId: policeRegion?.id,
            severity,
            congestionLength: worstRoute.congestionLength,
            startLat: worstRoute.congestedSegments[0]?.startLocation?.lat || origin.lat,
            startLng: worstRoute.congestedSegments[0]?.startLocation?.lng || origin.lng,
            endLat:
              worstRoute.congestedSegments[worstRoute.congestedSegments.length - 1]?.endLocation
                ?.lat || destination.lat,
            endLng:
              worstRoute.congestedSegments[worstRoute.congestedSegments.length - 1]?.endLocation
                ?.lng || destination.lng,
            startAddress,
            endAddress,
          },
          include: {
            policeRegion: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        // Send notification to assigned police
        if (policeRegion?.user) {
          await this.sendPoliceAlert(alert, policeRegion.user);
        }

        // Cache the result for 5 minutes
        await cache.set(cacheKey, { alert, congestionData }, 300);

        return { alert, congestionData };
      }

      // Cache negative result for 2 minutes
      await cache.set(cacheKey, { alert: null, congestionData }, 120);

      return { alert: null, congestionData };
    } catch (error) {
      logger.error('Traffic detection error:', error);
      throw error;
    }
  }

  /**
   * Find nearest police region to given coordinates
   */
  async findNearestPoliceRegion(lat, lng) {
    try {
      const regions = await prisma.policeRegion.findMany({
        where: { isActive: true },
        include: {
          user: {
            select: {
              id: true,
              isActive: true,
            },
          },
        },
      });

      let nearestRegion = null;
      let minDistance = Infinity;

      for (const region of regions) {
        // Check if user is active
        if (!region.user?.isActive) continue;

        // Calculate distance from point to region center
        const distance = googleMapsService.calculateDistance(
          lat,
          lng,
          region.centerLat,
          region.centerLng
        );

        // Check if point is within region radius
        if (distance <= region.radius && distance < minDistance) {
          minDistance = distance;
          nearestRegion = region;
        }
      }

      return nearestRegion;
    } catch (error) {
      logger.error('Find nearest police region error:', error);
      return null;
    }
  }

  /**
   * Send alert notification to police user
   */
  async sendPoliceAlert(alert, policeUser) {
    try {
      // Create notification
      const notification = await prisma.notification.create({
        data: {
          userId: policeUser.id,
          type: 'TRAFFIC_ALERT',
          title: 'New Traffic Alert',
          message: `Traffic congestion detected: ${alert.congestionLength.toFixed(2)}km`,
          data: {
            alertId: alert.id,
            severity: alert.severity,
            congestionLength: alert.congestionLength,
            location: {
              lat: alert.startLat,
              lng: alert.startLng,
            },
          },
        },
      });

      // Emit Socket.io event to police user
      const io = getIO();
      if (io) {
        io.to(`user:${policeUser.id}`).emit('traffic_alert', {
          notification,
          alert,
        });
      }

      logger.info(`Police alert sent to user: ${policeUser.id}`);
    } catch (error) {
      logger.error('Send police alert error:', error);
    }
  }

  /**
   * Check daily routes for traffic
   */
  async checkDailyRoutes() {
    try {
      const activeRoutes = await prisma.dailyRoute.findMany({
        where: { isActive: true },
        include: {
          user: {
            select: {
              id: true,
              isActive: true,
            },
          },
        },
      });

      const results = [];

      for (const route of activeRoutes) {
        if (!route.user?.isActive) continue;

        try {
          const result = await this.detectTraffic(
            { lat: route.originLat, lng: route.originLng },
            { lat: route.destLat, lng: route.destLng },
            route.userId,
            route.id
          );

          if (result.alert) {
            // Send notification to daily user
            await this.sendUserNotification(route.userId, result.alert, route);
            results.push({ routeId: route.id, alert: result.alert });
          }
        } catch (error) {
          logger.error(`Error checking route ${route.id}:`, error);
        }
      }

      return results;
    } catch (error) {
      logger.error('Check daily routes error:', error);
      throw error;
    }
  }

  /**
   * Send notification to user
   */
  async sendUserNotification(userId, alert, route = null) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          type: route ? 'ROUTE_UPDATE' : 'TRAFFIC_ALERT',
          title: route ? 'Route Traffic Alert' : 'Traffic Alert',
          message: `Traffic congestion detected on your route: ${alert.congestionLength.toFixed(2)}km`,
          data: {
            alertId: alert.id,
            routeId: route?.id,
            congestionLength: alert.congestionLength,
          },
        },
      });

      // Emit Socket.io event
      const io = getIO();
      if (io) {
        io.to(`user:${userId}`).emit('traffic_alert', {
          notification,
          alert,
        });
      }
    } catch (error) {
      logger.error('Send user notification error:', error);
    }
  }
}

module.exports = new TrafficDetectionService();

