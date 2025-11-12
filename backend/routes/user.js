const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { createRoute, getRoutes, deleteRoute, getDashboard } = require('../controllers/userController');
const { validateRoute } = require('../utils/validation');

// All routes require authentication
router.use(authenticate);

router.post('/route', validateRoute, createRoute);
router.get('/routes', getRoutes);
router.delete('/route/:routeId', deleteRoute);
router.get('/dashboard', getDashboard);

module.exports = router;

