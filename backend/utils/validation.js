const { body, validationResult } = require('express-validator');

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

/**
 * Validation rules for user registration
 */
const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidationErrors
];

/**
 * Validation rules for login
 */
const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

/**
 * Validation rules for region creation
 */
const validateRegion = [
  body('name')
    .trim()
    .notEmpty().withMessage('Region name is required'),
  body('startLat')
    .isFloat({ min: -90, max: 90 }).withMessage('Invalid start latitude'),
  body('startLng')
    .isFloat({ min: -180, max: 180 }).withMessage('Invalid start longitude'),
  body('endLat')
    .isFloat({ min: -90, max: 90 }).withMessage('Invalid end latitude'),
  body('endLng')
    .isFloat({ min: -180, max: 180 }).withMessage('Invalid end longitude'),
  handleValidationErrors
];

/**
 * Validation rules for route creation
 */
const validateRoute = [
  body('sourceLat')
    .isFloat({ min: -90, max: 90 }).withMessage('Invalid source latitude'),
  body('sourceLng')
    .isFloat({ min: -180, max: 180 }).withMessage('Invalid source longitude'),
  body('destinationLat')
    .isFloat({ min: -90, max: 90 }).withMessage('Invalid destination latitude'),
  body('destinationLng')
    .isFloat({ min: -180, max: 180 }).withMessage('Invalid destination longitude'),
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateRegion,
  validateRoute,
  handleValidationErrors
};

