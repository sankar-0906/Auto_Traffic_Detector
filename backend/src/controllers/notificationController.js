/**
 * Notification Controller
 * Handles user notifications
 */

const prisma = require('../config/database');
const logger = require('../config/logger');

/**
 * Get user notifications
 */
const getNotifications = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0, isRead } = req.query;

    const where = {
      userId: req.user.id,
    };

    if (isRead !== undefined) {
      where.isRead = isRead === 'true';
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await prisma.notification.count({ where });
    const unreadCount = await prisma.notification.count({
      where: {
        userId: req.user.id,
        isRead: false,
      },
    });

    res.json({
      success: true,
      data: {
        notifications,
        total,
        unreadCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    logger.error('Get notifications error:', error);
    next(error);
  }
};

/**
 * Mark notification as read
 */
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: { notification: updated },
    });
  } catch (error) {
    logger.error('Mark notification as read error:', error);
    next(error);
  }
};

/**
 * Mark all notifications as read
 */
const markAllAsRead = async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: req.user.id,
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    logger.error('Mark all notifications as read error:', error);
    next(error);
  }
};

/**
 * Delete notification
 */
const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    await prisma.notification.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    logger.error('Delete notification error:', error);
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};

