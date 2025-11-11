/**
 * Authentication Routes
 * Handles all authentication-related endpoints
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const {
  registerValidation,
  loginValidation,
  handleValidationErrors,
} = require('../utils/validators');

// Public routes
router.post(
  '/register',
  registerValidation,
  handleValidationErrors,
  authController.register
);

router.post(
  '/login',
  loginValidation,
  handleValidationErrors,
  authController.login
);

router.post('/refresh-token', authController.refreshToken);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/profile', authenticate, authController.getProfile);

module.exports = router;

