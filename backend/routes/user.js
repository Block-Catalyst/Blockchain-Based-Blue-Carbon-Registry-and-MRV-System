const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult, query } = require('express-validator');
const User = require('../models/User');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { upload, uploadBase64Image, deleteImage } = require('../config/cloudinary');
const router = express.Router();

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (Admin)
router.get('/', auth, adminAuth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('role').optional().isIn(['field', 'admin', 'verifier']),
  query('search').optional().isString().trim(),
  query('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};

    if (req.query.role) {
      query.role = req.query.role;
    }

    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }

    if (req.query.search) {
      query.$or = [
        { fullName: new RegExp(req.query.search, 'i') },
        { email: new RegExp(req.query.search, 'i') },
        { organization: new RegExp(req.query.search, 'i') },
        { location: new RegExp(req.query.search, 'i') }
      ];
    }

    const users = await User.find(query)
      .select('-password -loginAttempts -lockUntil -resetPasswordToken -resetPasswordExpire')
      .populate('activeProjectsCount')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await User.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount: total,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Private (Admin or Self)
router.get('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin or requesting their own data
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const user = await User.findById(req.params.id)
      .select('-password -loginAttempts -lockUntil -resetPasswordToken -resetPasswordExpire')
      .populate('projects', 'name status credits area createdAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user statistics
    const userStats = await Project.aggregate([
      { $match: { submittedBy: user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalCredits: { $sum: '$credits' },
          totalArea: { $sum: '$area' }
        }
      }
    ]);

    const formattedStats = userStats.reduce((acc, stat) => {
      acc[stat._id] = {
        count: stat.count,
        totalCredits: stat.totalCredits,
        totalArea: stat.totalArea
      };
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        user,
        statistics: formattedStats
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private (Admin or Self)
router.put('/:id', auth, [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('organization')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Organization name cannot exceed 200 characters'),
  body('phone')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Please enter a valid 10-digit phone number'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location cannot exceed 200 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check if user is admin or updating their own profile
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const allowedUpdates = ['fullName', 'organization', 'phone', 'location', 'userRole'];
    
    // Admin can update additional fields
    if (req.user.role === 'admin') {
      allowedUpdates.push('role', 'isActive', 'isVerified');
    }

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true
      }
    ).select('-password -loginAttempts -lockUntil -resetPasswordToken -resetPasswordExpire');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
});

// @desc    Upload user profile image
// @route   POST /api/users/:id/profile-image
// @access  Private (Admin or Self)
router.post('/:id/profile-image', auth, upload.single('profileImage'), async (req, res) => {
  try {
    // Check if user is admin or updating their own profile
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete old profile image if it exists
    if (user.profileImage) {
      try {
        const publicId = user.profileImage.split('/').pop().split('.')[0];
        await deleteImage(`blue-carbon-mrv/profiles/${publicId}`);
      } catch (deleteError) {
        console.error('Error deleting old profile image:', deleteError);
      }
    }

    // Update user with new profile image
    user.profileImage = req.file.path;
    await user.save();

    res.json({
      success: true,
      message: 'Profile image updated successfully',
      data: {
        profileImage: user.profileImage
      }
    });

  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile image',
      error: error.message
    });
  }
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deletion of admin users
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }

    // Check if user has active projects
    const activeProjects = await Project.countDocuments({
      submittedBy: user._id,
      status: { $in: ['pending', 'approved', 'under_review'] }
    });

    if (activeProjects > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete user with ${activeProjects} active projects. Please resolve or transfer projects first.`
      });
    }

    // Delete profile image from Cloudinary
    if (user.profileImage) {
      try {
        const publicId = user.profileImage.split('/').pop().split('.')[0];
        await deleteImage(`blue-carbon-mrv/profiles/${publicId}`);
      } catch (deleteError) {
        console.error('Error deleting profile image:', deleteError);
      }
    }

    // Soft delete - deactivate user instead of hard delete
    user.isActive = false;
    user.email = `deleted_${Date.now()}_${user.email}`;
    await user.save();

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

// @desc    Get user statistics
// @route   GET /api/users/:id/stats
// @access  Private (Admin or Self)
router.get('/:id/stats', auth, async (req, res) => {
  try {
    // Check if user is admin or requesting their own data
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const userId = req.params.id;

    // Get user projects and statistics
    const projectStats = await Project.aggregate([
      { $match: { submittedBy: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalCredits: { $sum: '$credits' },
          totalArea: { $sum: '$area' }
        }
      }
    ]);

    // Get monthly project creation trend
    const monthlyTrend = await Project.aggregate([
      { $match: { submittedBy: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          credits: { $sum: '$credits' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get method distribution
    const methodStats = await Project.aggregate([
      { $match: { submittedBy: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$method',
          count: { $sum: 1 },
          totalCredits: { $sum: '$credits' },
          avgArea: { $avg: '$area' }
        }
      }
    ]);

    const formattedProjectStats = projectStats.reduce((acc, stat) => {
      acc[stat._id] = stat;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        projectsByStatus: formattedProjectStats,
        monthlyTrend,
        methodDistribution: methodStats
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics',
      error: error.message
    });
  }
});

// @desc    Bulk update users (Admin only)
// @route   PUT /api/users/bulk
// @access  Private (Admin)
router.put('/bulk', auth, adminAuth, [
  body('userIds')
    .isArray({ min: 1 })
    .withMessage('User IDs array is required'),
  body('updates')
    .isObject()
    .withMessage('Updates object is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { userIds, updates } = req.body;

    // Validate allowed bulk updates
    const allowedBulkUpdates = ['isActive', 'isVerified', 'role'];
    const validUpdates = {};
    
    Object.keys(updates).forEach(key => {
      if (allowedBulkUpdates.includes(key)) {
        validUpdates[key] = updates[key];
      }
    });

    if (Object.keys(validUpdates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid updates provided'
      });
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      validUpdates
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} users updated successfully`,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      }
    });

  } catch (error) {
    console.error('Bulk update users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update users',
      error: error.message
    });
  }
});

module.exports = router;