/**
 * Police Routes
 */

const express = require('express');
const router = express.Router();
const policeController = require('../controllers/policeController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication and TRAFFIC_POLICE role
router.use(authenticate);
router.use(authorize('TRAFFIC_POLICE'));

router.get('/region', policeController.getPoliceRegion);
router.get('/alerts', policeController.getAlerts);
router.put('/alerts/:id/status', policeController.updateAlertStatus);
router.get('/stats', policeController.getAlertStats);

module.exports = router;

