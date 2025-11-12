const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const { createRegion, getRegion, getDashboard } = require('../controllers/policeController');
const { validateRegion } = require('../utils/validation');

// All routes require authentication and police/admin role
router.use(authenticate);
router.use(authorize('POLICE', 'ADMIN'));

router.post('/region', validateRegion, createRegion);
router.get('/region', getRegion);
router.get('/dashboard', getDashboard);

module.exports = router;

