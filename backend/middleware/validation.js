const { body, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Common validation rules
const userValidation = {
  register: [
    body('fullName')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be between 2 and 100 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Full name can only contain letters and spaces'),
    
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please enter a valid email address')
      .custom(async (value) => {
        const User = require('../models/User');
        const existingUser = await User.findOne({ email: value });
        if (existingUser) {
          throw new Error('Email already in use');
        }
        return true;
      }),
    
    body('password')
      .isLength({ min: 6, max: 128 })
      .withMessage('Password must be between 6 and 128 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match');
        }
        return true;
      }),
    
    body('organization')
      .optional()
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('Organization name must be between 2 and 200 characters'),
    
    body('phone')
      .optional()
      .matches(/^[0-9]{10}$/)
      .withMessage('Please enter a valid 10-digit phone number'),
    
    body('location')
      .optional()
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('Location must be between 2 and 200 characters')
  ],

  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please enter a valid email address'),
    
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    
    body('role')
      .isIn(['field', 'admin', 'verifier'])
      .withMessage('Role must be field, admin, or verifier')
  ],

  updateProfile: [
    body('fullName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be between 2 and 100 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Full name can only contain letters and spaces'),
    
    body('organization')
      .optional()
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('Organization name must be between 2 and 200 characters'),
    
    body('phone')
      .optional()
      .matches(/^[0-9]{10}$/)
      .withMessage('Please enter a valid 10-digit phone number'),
    
    body('location')
      .optional()
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('Location must be between 2 and 200 characters')
  ]
};

const projectValidation = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 3, max: 200 })
      .withMessage('Project name must be between 3 and 200 characters')
      .matches(/^[a-zA-Z0-9\s\-_]+$/)
      .withMessage('Project name can only contain letters, numbers, spaces, hyphens, and underscores'),
    
    body('description')
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Description must be between 10 and 2000 characters'),
    
    body('organization')
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('Organization name must be between 2 and 200 characters'),
    
    body('region')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Region must be between 2 and 100 characters'),
    
    body('area')
      .isFloat({ min: 0.1, max: 10000 })
      .withMessage('Area must be between 0.1 and 10,000 hectares'),
    
    body('method')
      .isIn(['plantation', 'natural_regeneration', 'mixed'])
      .withMessage('Method must be plantation, natural_regeneration, or mixed'),
    
    body('vintage')
      .isInt({ min: 2000, max: new Date().getFullYear() + 5 })
      .withMessage('Vintage must be a valid year between 2000 and 5 years in the future'),
    
    body('coordinates')
      .optional()
      .isArray({ min: 2, max: 2 })
      .withMessage('Coordinates must be an array of exactly 2 numbers [longitude, latitude]')
      .custom((value) => {
        if (value) {
          const [lng, lat] = value;
          if (typeof lng !== 'number' || typeof lat !== 'number') {
            throw new Error('Coordinates must be numbers');
          }
          if (lng < -180 || lng > 180) {
            throw new Error('Longitude must be between -180 and 180');
          }
          if (lat < -90 || lat > 90) {
            throw new Error('Latitude must be between -90 and 90');
          }
        }
        return true;
      }),
    
    body('speciesMix')
      .optional()
      .isArray()
      .withMessage('Species mix must be an array')
      .custom((value) => {
        if (value && value.length > 0) {
          const totalPercentage = value.reduce((sum, species) => {
            if (!species.species || !species.percentage) {
              throw new Error('Each species must have species name and percentage');
            }
            if (typeof species.percentage !== 'number' || species.percentage < 0 || species.percentage > 100) {
              throw new Error('Species percentage must be a number between 0 and 100');
            }
            return sum + species.percentage;
          }, 0);
          
          if (Math.abs(totalPercentage - 100) > 0.1) {
            throw new Error('Total species percentage must equal 100%');
          }
        }
        return true;
      })
  ],

  updateStatus: [
    body('status')
      .isIn(['pending', 'approved', 'rejected', 'verified', 'under_review'])
      .withMessage('Invalid status'),
    
    body('comment')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Comment cannot exceed 1000 characters'),
    
    body('credits')
      .optional()
      .isInt({ min: 0, max: 100000 })
      .withMessage('Credits must be a non-negative integer not exceeding 100,000')
  ],

  addMilestone: [
    body('title')
      .trim()
      .isLength({ min: 3, max: 200 })
      .withMessage('Milestone title must be between 3 and 200 characters'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
    
    body('targetDate')
      .optional()
      .isISO8601()
      .withMessage('Target date must be a valid ISO 8601 date')
      .custom((value) => {
        if (value && new Date(value) < new Date()) {
          throw new Error('Target date cannot be in the past');
        }
        return true;
      })
  ]
};

// File validation
const fileValidation = {
  image: (req, res, next) => {
    if (req.file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'
        });
      }

      if (req.file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: 'File size too large. Maximum size is 10MB.'
        });
      }
    }
    next();
  },

  document: (req, res, next) => {
    if (req.file) {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/geo+json'
      ];
      const maxSize = 25 * 1024 * 1024; // 25MB

      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid file type. Only PDF, Word documents, text files, and GeoJSON are allowed.'
        });
      }

      if (req.file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: 'File size too large. Maximum size is 25MB.'
        });
      }
    }
    next();
  }
};

// Sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Remove any HTML tags from string inputs
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      return value.replace(/<[^>]*>?/gm, '').trim();
    }
    return value;
  };

  // Recursively sanitize object
  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        sanitizeObject(obj[key]);
      } else if (Array.isArray(obj[key])) {
        obj[key] = obj[key].map(item => 
          typeof item === 'object' ? sanitizeObject(item) : sanitizeValue(item)
        );
      } else {
        obj[key] = sanitizeValue(obj[key]);
      }
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  next();
};

module.exports = {
  handleValidationErrors,
  userValidation,
  projectValidation,
  fileValidation,
  sanitizeInput
};