/**
 * Traffic Monitor Job
 * Periodically checks daily routes for traffic congestion
 */

const cron = require('node-cron');
const trafficDetectionService = require('../services/trafficDetectionService');
const logger = require('../config/logger');

/**
 * Run traffic check for all daily routes
 * Runs every 15 minutes
 */
const startTrafficMonitor = () => {
  cron.schedule('*/15 * * * *', async () => {
    try {
      logger.info('Running scheduled traffic check for daily routes');
      const results = await trafficDetectionService.checkDailyRoutes();
      logger.info(`Traffic check completed. Found ${results.length} alerts.`);
    } catch (error) {
      logger.error('Scheduled traffic check error:', error);
    }
  });

  logger.info('Traffic monitor job started (runs every 15 minutes)');
};

module.exports = { startTrafficMonitor };

