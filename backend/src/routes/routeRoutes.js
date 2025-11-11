/**
 * Route Management Routes
 */

const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');
const { authenticate, authorize } = require('../middleware/auth');
const { routeValidation, handleValidationErrors } = require('../utils/validators');

// All routes require authentication
router.use(authenticate);

// Daily user routes
router.post(
  '/',
  authorize('DAILY_USER', 'NORMAL_USER'),
  routeValidation,
  handleValidationErrors,
  routeController.createRoute
);

router.get('/', routeController.getRoutes);
router.get('/:id', routeController.getRoute);
router.put('/:id', routeValidation, handleValidationErrors, routeController.updateRoute);
router.delete('/:id', routeController.deleteRoute);
router.post('/:id/check-traffic', routeController.checkRouteTraffic);

module.exports = router;

