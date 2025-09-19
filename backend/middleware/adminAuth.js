// Middleware to check if user is admin
const adminAuth = (req, res, next) => {
  // Check if user is authenticated first
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication required.'
    });
  }

  // Check if user has admin role
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  next();
};

// Middleware to check if user is admin or verifier
const verifierAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication required.'
    });
  }

  if (!['admin', 'verifier'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin or verifier privileges required.'
    });
  }

  next();
};

// Middleware to check if user owns resource or is admin
const ownerOrAdmin = (resourceField = 'submittedBy') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      });
    }

    // Admin can access everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Check ownership - this will be validated in the route handler
    // since we need to fetch the resource first
    req.requireOwnership = {
      field: resourceField,
      userId: req.user.id
    };
    
    next();
  };
};

module.exports = adminAuth;
module.exports.adminAuth = adminAuth;
module.exports.verifierAuth = verifierAuth;
module.exports.ownerOrAdmin = ownerOrAdmin;