/**
 * Traffic Controller
 * Handles traffic detection and route management endpoints
 */

const prisma = require('../config/database');
const logger = require('../config/logger');
const trafficDetectionService = require('../services/trafficDetectionService');
const googleMapsService = require('../services/googleMapsService');

/**
 * Detect traffic for a route
 */
const detectTraffic = async (req, res, next) => {
  try {
    const { origin, destination } = req.body;

    if (!origin || !destination || !origin.lat || !origin.lng || !destination.lat || !destination.lng) {
      return res.status(400).json({
        success: false,
        message: 'Origin and destination coordinates are required',
      });
    }

    const result = await trafficDetectionService.detectTraffic(
      origin,
      destination,
      req.user.id
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Detect traffic error:', error);
    next(error);
  }
};

/**
 * Get traffic data for coordinates
 */
const getTrafficData = async (req, res, next) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    // Get nearby alerts
    const alerts = await prisma.trafficAlert.findMany({
      where: {
        status: {
          in: ['PENDING', 'ACKNOWLEDGED'],
        },
        startLat: {
          gte: parseFloat(lat) - 0.1,
          lte: parseFloat(lat) + 0.1,
        },
        startLng: {
          gte: parseFloat(lng) - 0.1,
          lte: parseFloat(lng) + 0.1,
        },
      },
      include: {
        policeRegion: true,
      },
      take: 50,
      orderBy: {
        detectedAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: { alerts },
    });
  } catch (error) {
    logger.error('Get traffic data error:', error);
    next(error);
  }
};

/**
 * Get directions with traffic
 */
const getDirections = async (req, res, next) => {
  try {
    const { origin, destination, options = {} } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        message: 'Origin and destination are required',
      });
    }

    const directionsData = await googleMapsService.getDirections(origin, destination, options);
    const congestionData = googleMapsService.analyzeTrafficCongestion(directionsData);

    res.json({
      success: true,
      data: {
        directions: directionsData,
        congestion: congestionData,
      },
    });
  } catch (error) {
    logger.error('Get directions error:', error);
    next(error);
  }
};

module.exports = {
  detectTraffic,
  getTrafficData,
  getDirections,
};

