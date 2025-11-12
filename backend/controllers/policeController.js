const { PrismaClient } = require('@prisma/client');
const { validateRegion } = require('../utils/validation');

const prisma = new PrismaClient();

/**
 * Create or update police region
 */
const createRegion = async (req, res) => {
  try {
    const { name, startLat, startLng, endLat, endLng, coordinates } = req.body;
    const policeId = req.user.id;

    // Check if region already exists
    const existingRegion = await prisma.region.findUnique({
      where: { policeId }
    });

    let region;

    if (existingRegion) {
      // Update existing region
      region = await prisma.region.update({
        where: { id: existingRegion.id },
        data: {
          name,
          startLat,
          startLng,
          endLat,
          endLng,
          coordinates: coordinates || null
        }
      });
    } else {
      // Create new region
      region = await prisma.region.create({
        data: {
          policeId,
          name,
          startLat,
          startLng,
          endLat,
          endLng,
          coordinates: coordinates || null
        }
      });
    }

    res.json({
      success: true,
      message: 'Region saved successfully',
      data: region
    });
  } catch (error) {
    console.error('Create region error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving region',
      error: error.message
    });
  }
};

/**
 * Get police region
 */
const getRegion = async (req, res) => {
  try {
    const region = await prisma.region.findUnique({
      where: { policeId: req.user.id }
    });

    if (!region) {
      return res.status(404).json({
        success: false,
        message: 'Region not found. Please create a region first.'
      });
    }

    res.json({
      success: true,
      data: region
    });
  } catch (error) {
    console.error('Get region error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching region',
      error: error.message
    });
  }
};

/**
 * Get police dashboard data
 */
const getDashboard = async (req, res) => {
  try {
    const region = await prisma.region.findUnique({
      where: { policeId: req.user.id }
    });

    if (!region) {
      return res.json({
        success: true,
        data: {
          region: null,
          alerts: [],
          stats: {
            totalAlerts: 0,
            pendingAlerts: 0,
            resolvedAlerts: 0
          }
        }
      });
    }

    const alerts = await prisma.alert.findMany({
      where: { regionId: region.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const stats = {
      totalAlerts: alerts.length,
      pendingAlerts: alerts.filter(a => a.status === 'PENDING').length,
      resolvedAlerts: alerts.filter(a => a.status === 'RESOLVED').length
    };

    res.json({
      success: true,
      data: {
        region,
        alerts,
        stats
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
};

module.exports = { createRegion, getRegion, getDashboard };

