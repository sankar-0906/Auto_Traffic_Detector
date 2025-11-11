/**
 * Validation utilities
 * Common validation functions for request data
 */

const { body, validationResult } = require('express-validator');
const { log } = require('winston');

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  console.log(req.body)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

/**
 * Register validation rules
 */
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase, one lowercase, and one number'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('role')
    .optional()
    .isIn(['TRAFFIC_POLICE', 'DAILY_USER', 'NORMAL_USER'])
    .withMessage('Invalid role'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
];

/**
 * Login validation rules
 */
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

/**
 * Route validation rules
 */
const routeValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Route name must be between 1 and 100 characters'),
  body('originLat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid origin latitude'),
  body('originLng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid origin longitude'),
  body('destLat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid destination latitude'),
  body('destLng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid destination longitude'),
  body('originName')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Origin name is required'),
  body('destName')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Destination name is required'),
];

module.exports = {
  handleValidationErrors,
  registerValidation,
  loginValidation,
  routeValidation,
};

