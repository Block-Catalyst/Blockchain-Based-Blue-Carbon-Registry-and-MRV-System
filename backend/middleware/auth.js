const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const auth = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies (if using cookies)
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Handle admin user (hardcoded)
    if (decoded.id === 'admin') {
      req.user = {
        id: 'admin',
        role: 'admin',
        email: 'admin@example.com'
      };
      return next();
    }

    // Get user from database
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is invalid. User not found.'
      });
    }

    // Check if user account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Contact support.'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked. Try again later.'
      });
    }

    // Add user to request object
    req.user = user;
    next();

  } catch (error) {
    console.error('Auth middleware error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Token verification failed'
    });
  }
};

// Optional auth - doesn't fail if no token provided
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.id === 'admin') {
      req.user = {
        id: 'admin',
        role: 'admin',
        email: 'admin@example.com'
      };
    } else {
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.isActive && !user.isLocked) {
        req.user = user;
      }
    }
  } catch (error) {
    // Ignore token errors in optional auth
    console.log('Optional auth token error:', error.message);
  }

  next();
};

// Middleware to check specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please login.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role ${req.user.role} is not authorized to access this resource.`
      });
    }

    next();
  };
};

// Middleware to check if user owns resource or is admin
const authorizeResourceOwner = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please login.'
    });
  }

  // Admin can access any resource
  if (req.user.role === 'admin') {
    return next();
  }

  // Check if user owns the resource (assuming resource has userId field)
  const resourceUserId = req.params.userId || req.body.userId;
  
  if (resourceUserId && resourceUserId !== req.user.id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own resources.'
    });
  }

  next();
};

module.exports = {
  auth,
  optionalAuth,
  authorize,
  authorizeResourceOwner
};