/**
 * Traffic Routes
 */

const express = require('express');
const router = express.Router();
const trafficController = require('../controllers/trafficController');
const { authenticate } = require('../middleware/auth');

router.post('/detect', authenticate, trafficController.detectTraffic);
router.get('/data', authenticate, trafficController.getTrafficData);
router.post('/directions', authenticate, trafficController.getDirections);

module.exports = router;

