/**
 * Route Controller
 * Handles daily route management for users
 */

const prisma = require('../config/database');
const logger = require('../config/logger');
const trafficDetectionService = require('../services/trafficDetectionService');

/**
 * Create a daily route
 */
const createRoute = async (req, res, next) => {
  try {
    const { name, originLat, originLng, destLat, destLng, originName, destName } = req.body;

    const route = await prisma.dailyRoute.create({
      data: {
        userId: req.user.id,
        name,
        originLat,
        originLng,
        destLat,
        destLng,
        originName,
        destName,
      },
    });

    logger.info(`Daily route created: ${route.id} by user ${req.user.id}`);

    res.status(201).json({
      success: true,
      message: 'Route created successfully',
      data: { route },
    });
  } catch (error) {
    logger.error('Create route error:', error);
    next(error);
  }
};

/**
 * Get all routes for current user
 */
const getRoutes = async (req, res, next) => {
  try {
    const routes = await prisma.dailyRoute.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: { routes },
    });
  } catch (error) {
    logger.error('Get routes error:', error);
    next(error);
  }
};

/**
 * Get single route by ID
 */
const getRoute = async (req, res, next) => {
  try {
    const { id } = req.params;

    const route = await prisma.dailyRoute.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found',
      });
    }

    res.json({
      success: true,
      data: { route },
    });
  } catch (error) {
    logger.error('Get route error:', error);
    next(error);
  }
};

/**
 * Update route
 */
const updateRoute = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, originLat, originLng, destLat, destLng, originName, destName, isActive } =
      req.body;

    // Check if route exists and belongs to user
    const existingRoute = await prisma.dailyRoute.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!existingRoute) {
      return res.status(404).json({
        success: false,
        message: 'Route not found',
      });
    }

    const route = await prisma.dailyRoute.update({
      where: { id },
      data: {
        name,
        originLat,
        originLng,
        destLat,
        destLng,
        originName,
        destName,
        isActive,
      },
    });

    logger.info(`Route updated: ${route.id} by user ${req.user.id}`);

    res.json({
      success: true,
      message: 'Route updated successfully',
      data: { route },
    });
  } catch (error) {
    logger.error('Update route error:', error);
    next(error);
  }
};

/**
 * Delete route
 */
const deleteRoute = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if route exists and belongs to user
    const existingRoute = await prisma.dailyRoute.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!existingRoute) {
      return res.status(404).json({
        success: false,
        message: 'Route not found',
      });
    }

    await prisma.dailyRoute.delete({
      where: { id },
    });

    logger.info(`Route deleted: ${id} by user ${req.user.id}`);

    res.json({
      success: true,
      message: 'Route deleted successfully',
    });
  } catch (error) {
    logger.error('Delete route error:', error);
    next(error);
  }
};

/**
 * Check traffic for a specific route
 */
const checkRouteTraffic = async (req, res, next) => {
  try {
    const { id } = req.params;

    const route = await prisma.dailyRoute.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found',
      });
    }

    const result = await trafficDetectionService.detectTraffic(
      { lat: route.originLat, lng: route.originLng },
      { lat: route.destLat, lng: route.destLng },
      req.user.id,
      route.id
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Check route traffic error:', error);
    next(error);
  }
};

module.exports = {
  createRoute,
  getRoutes,
  getRoute,
  updateRoute,
  deleteRoute,
  checkRouteTraffic,
};

