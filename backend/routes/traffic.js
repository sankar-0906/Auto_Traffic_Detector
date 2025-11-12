const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { detectRouteTraffic, getAlternateRoutes } = require('../services/trafficDetectionService');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Check traffic for a specific route
 */
router.post('/check', authenticate, async (req, res) => {
  try {
    const { sourceLat, sourceLng, destinationLat, destinationLng, routeId } = req.body;

    let route;
    if (routeId) {
      route = await prisma.route.findUnique({
        where: { id: routeId }
      });

      if (!route || route.userId !== req.user.id) {
        return res.status(404).json({
          success: false,
          message: 'Route not found'
        });
      }
    } else {
      route = {
        sourceLat,
        sourceLng,
        destinationLat,
        destinationLng
      };
    }

    const trafficData = await detectRouteTraffic(route);

    res.json({
      success: true,
      data: trafficData
    });
  } catch (error) {
    console.error('Check traffic error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking traffic',
      error: error.message
    });
  }
});

/**
 * Get alternate routes
 */
router.post('/alternate-routes', authenticate, async (req, res) => {
  try {
    const { sourceLat, sourceLng, destinationLat, destinationLng } = req.body;

    const routes = await getAlternateRoutes(sourceLat, sourceLng, destinationLat, destinationLng);

    res.json({
      success: true,
      data: routes
    });
  } catch (error) {
    console.error('Get alternate routes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching alternate routes',
      error: error.message
    });
  }
});

module.exports = router;

