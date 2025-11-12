const { PrismaClient } = require('@prisma/client');
const { validateRoute } = require('../utils/validation');

const prisma = new PrismaClient();

/**
 * Create a route (for daily users or normal users)
 */
const createRoute = async (req, res) => {
  try {
    const {
      name,
      sourceLat,
      sourceLng,
      destinationLat,
      destinationLng,
      sourceAddress,
      destAddress,
      isDaily,
      alertTimeStart,
      alertTimeEnd
    } = req.body;

    const route = await prisma.route.create({
      data: {
        userId: req.user.id,
        name,
        sourceLat,
        sourceLng,
        destinationLat,
        destinationLng,
        sourceAddress,
        destAddress,
        isDaily: isDaily || false,
        alertTimeStart,
        alertTimeEnd
      }
    });

    res.status(201).json({
      success: true,
      message: 'Route saved successfully',
      data: route
    });
  } catch (error) {
    console.error('Create route error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving route',
      error: error.message
    });
  }
};

/**
 * Get user routes
 */
const getRoutes = async (req, res) => {
  try {
    const routes = await prisma.route.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: routes
    });
  } catch (error) {
    console.error('Get routes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching routes',
      error: error.message
    });
  }
};

/**
 * Delete a route
 */
const deleteRoute = async (req, res) => {
  try {
    const { routeId } = req.params;

    const route = await prisma.route.findUnique({
      where: { id: routeId }
    });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    if (route.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this route'
      });
    }

    await prisma.route.delete({
      where: { id: routeId }
    });

    res.json({
      success: true,
      message: 'Route deleted successfully'
    });
  } catch (error) {
    console.error('Delete route error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting route',
      error: error.message
    });
  }
};

/**
 * Get user dashboard
 */
const getDashboard = async (req, res) => {
  try {
    const routes = await prisma.route.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    const notifications = await prisma.notification.findMany({
      where: {
        userId: req.user.id,
        isRead: false
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    res.json({
      success: true,
      data: {
        routes,
        notifications,
        stats: {
          totalRoutes: routes.length,
          dailyRoutes: routes.filter(r => r.isDaily).length,
          unreadNotifications: notifications.length
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard',
      error: error.message
    });
  }
};

module.exports = { createRoute, getRoutes, deleteRoute, getDashboard };

