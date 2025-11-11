/**
 * Police Controller
 * Handles police dashboard and alert management
 */

const prisma = require('../config/database');
const logger = require('../config/logger');

/**
 * Get police region
 */
const getPoliceRegion = async (req, res, next) => {
  try {
    const region = await prisma.policeRegion.findUnique({
      where: { userId: req.user.id },
      include: {
        alerts: {
          where: {
            status: {
              in: ['PENDING', 'ACKNOWLEDGED'],
            },
          },
          orderBy: {
            detectedAt: 'desc',
          },
          take: 50,
        },
      },
    });

    if (!region) {
      return res.status(404).json({
        success: false,
        message: 'Police region not assigned',
      });
    }

    res.json({
      success: true,
      data: { region },
    });
  } catch (error) {
    logger.error('Get police region error:', error);
    next(error);
  }
};

/**
 * Get alerts for police region
 */
const getAlerts = async (req, res, next) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    const region = await prisma.policeRegion.findUnique({
      where: { userId: req.user.id },
    });

    if (!region) {
      return res.status(404).json({
        success: false,
        message: 'Police region not assigned',
      });
    }

    const where = {
      policeRegionId: region.id,
    };

    if (status) {
      where.status = status;
    }

    const alerts = await prisma.trafficAlert.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        dailyRoute: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        detectedAt: 'desc',
      },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await prisma.trafficAlert.count({ where });

    res.json({
      success: true,
      data: {
        alerts,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    logger.error('Get alerts error:', error);
    next(error);
  }
};

/**
 * Update alert status
 */
const updateAlertStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!['PENDING', 'ACKNOWLEDGED', 'RESOLVED', 'IGNORED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    // Check if alert belongs to police region
    const region = await prisma.policeRegion.findUnique({
      where: { userId: req.user.id },
    });

    if (!region) {
      return res.status(404).json({
        success: false,
        message: 'Police region not assigned',
      });
    }

    const alert = await prisma.trafficAlert.findFirst({
      where: {
        id,
        policeRegionId: region.id,
      },
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found',
      });
    }

    const updateData = {
      status,
      notes,
    };

    if (status === 'RESOLVED') {
      updateData.resolvedAt = new Date();
    }

    const updatedAlert = await prisma.trafficAlert.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Emit Socket.io event
    const io = global.io;
    if (io) {
      io.emit('alert_updated', {
        alert: updatedAlert,
        updatedBy: req.user.id,
      });
    }

    logger.info(`Alert ${id} status updated to ${status} by police ${req.user.id}`);

    res.json({
      success: true,
      message: 'Alert status updated successfully',
      data: { alert: updatedAlert },
    });
  } catch (error) {
    logger.error('Update alert status error:', error);
    next(error);
  }
};

/**
 * Get alert statistics
 */
const getAlertStats = async (req, res, next) => {
  try {
    const region = await prisma.policeRegion.findUnique({
      where: { userId: req.user.id },
    });

    if (!region) {
      return res.status(404).json({
        success: false,
        message: 'Police region not assigned',
      });
    }

    const stats = {
      total: await prisma.trafficAlert.count({
        where: { policeRegionId: region.id },
      }),
      pending: await prisma.trafficAlert.count({
        where: {
          policeRegionId: region.id,
          status: 'PENDING',
        },
      }),
      acknowledged: await prisma.trafficAlert.count({
        where: {
          policeRegionId: region.id,
          status: 'ACKNOWLEDGED',
        },
      }),
      resolved: await prisma.trafficAlert.count({
        where: {
          policeRegionId: region.id,
          status: 'RESOLVED',
        },
      }),
      today: await prisma.trafficAlert.count({
        where: {
          policeRegionId: region.id,
          detectedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    };

    res.json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    logger.error('Get alert stats error:', error);
    next(error);
  }
};

module.exports = {
  getPoliceRegion,
  getAlerts,
  updateAlertStatus,
  getAlertStats,
};

