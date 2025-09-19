const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Project = require('../models/Project');
const User = require('../models/User');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { upload, uploadBase64Image, deleteImage } = require('../config/cloudinary');
const router = express.Router();

// @desc    Get all projects with filtering and pagination
// @route   GET /api/projects
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['pending', 'approved', 'rejected', 'verified', 'under_review']),
  query('region').optional().isString().trim(),
  query('organization').optional().isString().trim(),
  query('method').optional().isIn(['plantation', 'natural_regeneration', 'mixed']),
  query('search').optional().isString().trim()
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
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    let query = { isPublic: true };

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.region) {
      query.region = new RegExp(req.query.region, 'i');
    }

    if (req.query.organization) {
      query.organization = new RegExp(req.query.organization, 'i');
    }

    if (req.query.method) {
      query.method = req.query.method;
    }

    if (req.query.search) {
      query.$or = [
        { name: new RegExp(req.query.search, 'i') },
        { description: new RegExp(req.query.search, 'i') },
        { organization: new RegExp(req.query.search, 'i') },
        { region: new RegExp(req.query.search, 'i') }
      ];
    }

    // Execute query with pagination
    const projects = await Project.find(query)
      .populate('submittedBy', 'fullName email organization')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Project.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        projects,
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
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
      error: error.message
    });
  }
});

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('submittedBy', 'fullName email organization location')
      .populate('reviewComments.reviewedBy', 'fullName email')
      .populate('verificationData.verifiedBy', 'fullName email');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if project is public or user has access
    if (!project.isPublic && (!req.user || req.user.id !== project.submittedBy._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to private project'
      });
    }

    res.json({
      success: true,
      data: { project }
    });

  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project',
      error: error.message
    });
  }
});

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Field users)
router.post('/', auth, [
  body('name')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Project name must be between 3 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('organization')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Organization must be between 2 and 200 characters'),
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
    .withMessage('Vintage must be a valid year')
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

    const {
      name,
      description,
      organization,
      region,
      area,
      method,
      vintage,
      coordinates,
      geoData,
      speciesMix,
      imageBase64
    } = req.body;

    let images = [];

    // Handle base64 image upload
    if (imageBase64) {
      try {
        const result = await uploadBase64Image(imageBase64, 'blue-carbon-projects');
        images.push({
          url: result.secure_url,
          publicId: result.public_id,
          description: 'Project baseline image'
        });
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(400).json({
          success: false,
          message: 'Failed to upload image',
          error: uploadError.message
        });
      }
    }

    // Create project data
    const projectData = {
      name,
      description,
      organization,
      region,
      area,
      method,
      vintage,
      submittedBy: req.user.id,
      images
    };

    // Add location if coordinates provided
    if (coordinates && coordinates.length === 2) {
      projectData.location = {
        type: 'Point',
        coordinates: coordinates
      };
    }

    // Add GeoJSON data if provided
    if (geoData) {
      projectData.geoData = geoData;
    }

    // Add species mix if provided
    if (speciesMix && Array.isArray(speciesMix)) {
      projectData.speciesMix = speciesMix;
    }

    const project = await Project.create(projectData);

    // Add project to user's projects array
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { projects: project._id } }
    );

    // Populate the created project
    await project.populate('submittedBy', 'fullName email organization');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project }
    });

  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: error.message
    });
  }
});

// @desc    Upload project images
// @route   POST /api/projects/:id/images
// @access  Private
router.post('/:id/images', auth, upload.array('images', 5), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user owns the project or is admin
    if (project.submittedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images uploaded'
      });
    }

    // Add uploaded images to project
    const newImages = req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
      description: req.body.description || 'Project image'
    }));

    project.images.push(...newImages);
    await project.save();

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      data: { 
        project,
        uploadedImages: newImages
      }
    });

  } catch (error) {
    console.error('Upload images error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images',
      error: error.message
    });
  }
});

// @desc    Update project status (Admin only)
// @route   PUT /api/projects/:id/status
// @access  Private (Admin)
router.put('/:id/status', auth, adminAuth, [
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
    .isInt({ min: 0 })
    .withMessage('Credits must be a non-negative integer')
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

    const { status, comment, credits } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Update project status
    project.status = status;
    project.lastUpdatedBy = req.user.id;

    // Set credits if provided and status is approved/verified
    if (credits !== undefined && ['approved', 'verified'].includes(status)) {
      project.credits = credits;
    }

    // Add review comment if provided
    if (comment) {
      project.reviewComments.push({
        comment,
        reviewedBy: req.user.id,
        type: status === 'approved' ? 'approval' : status === 'rejected' ? 'rejection' : 'revision_request'
      });
    }

    await project.save();

    // Update user's total credits if approved/verified
    if (['approved', 'verified'].includes(status) && credits) {
      await User.findByIdAndUpdate(
        project.submittedBy,
        { $inc: { totalCredits: credits, totalArea: project.area } }
      );
    }

    await project.populate('submittedBy', 'fullName email organization');

    res.json({
      success: true,
      message: `Project ${status} successfully`,
      data: { project }
    });

  } catch (error) {
    console.error('Update project status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project status',
      error: error.message
    });
  }
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Owner or Admin)
router.put('/:id', auth, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Project name must be between 3 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('area')
    .optional()
    .isFloat({ min: 0.1, max: 10000 })
    .withMessage('Area must be between 0.1 and 10,000 hectares')
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

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user owns the project or is admin
    if (project.submittedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Don't allow updates to verified projects unless admin
    if (project.status === 'verified' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify verified projects'
      });
    }

    const allowedUpdates = ['name', 'description', 'area', 'region', 'organization', 'speciesMix', 'tags'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    updates.lastUpdatedBy = req.user.id;

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true
      }
    ).populate('submittedBy', 'fullName email organization');

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: { project: updatedProject }
    });

  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project',
      error: error.message
    });
  }
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Owner or Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user owns the project or is admin
    if (project.submittedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Don't allow deletion of verified projects
    if (project.status === 'verified') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete verified projects'
      });
    }

    // Delete images from Cloudinary
    for (const image of project.images) {
      try {
        await deleteImage(image.publicId);
      } catch (deleteError) {
        console.error('Error deleting image:', deleteError);
      }
    }

    // Delete documents from Cloudinary
    for (const doc of project.documents) {
      try {
        await deleteImage(doc.publicId);
      } catch (deleteError) {
        console.error('Error deleting document:', deleteError);
      }
    }

    // Remove project from user's projects array
    await User.findByIdAndUpdate(
      project.submittedBy,
      { $pull: { projects: project._id } }
    );

    // Delete the project
    await Project.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project',
      error: error.message
    });
  }
});

// @desc    Add milestone to project
// @route   POST /api/projects/:id/milestones
// @access  Private (Owner or Admin)
router.post('/:id/milestones', auth, [
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
    .withMessage('Target date must be a valid date')
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

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user owns the project or is admin
    if (project.submittedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const milestone = {
      title: req.body.title,
      description: req.body.description,
      targetDate: req.body.targetDate,
      status: 'pending'
    };

    project.milestones.push(milestone);
    await project.save();

    res.status(201).json({
      success: true,
      message: 'Milestone added successfully',
      data: { 
        project,
        milestone: project.milestones[project.milestones.length - 1]
      }
    });

  } catch (error) {
    console.error('Add milestone error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add milestone',
      error: error.message
    });
  }
});

// @desc    Update milestone status
// @route   PUT /api/projects/:id/milestones/:milestoneId
// @access  Private (Owner or Admin)
router.put('/:id/milestones/:milestoneId', auth, [
  body('status')
    .isIn(['pending', 'in_progress', 'completed', 'delayed'])
    .withMessage('Invalid milestone status')
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

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user owns the project or is admin
    if (project.submittedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const milestone = project.milestones.id(req.params.milestoneId);
    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found'
      });
    }

    milestone.status = req.body.status;
    if (req.body.status === 'completed') {
      milestone.completedDate = new Date();
    }

    await project.save();

    res.json({
      success: true,
      message: 'Milestone updated successfully',
      data: { milestone }
    });

  } catch (error) {
    console.error('Update milestone error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update milestone',
      error: error.message
    });
  }
});

// @desc    Get user's projects
// @route   GET /api/projects/user/my-projects
// @access  Private
router.get('/user/my-projects', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const projects = await Project.find({ submittedBy: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Project.countDocuments({ submittedBy: req.user.id });
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        projects,
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
    console.error('Get user projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user projects',
      error: error.message
    });
  }
});

// @desc    Get projects by status (Admin only)
// @route   GET /api/projects/admin/by-status/:status
// @access  Private (Admin)
router.get('/admin/by-status/:status', auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    if (!['pending', 'approved', 'rejected', 'verified', 'under_review'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const projects = await Project.find({ status })
      .populate('submittedBy', 'fullName email organization')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Project.countDocuments({ status });
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        projects,
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
    console.error('Get projects by status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects by status',
      error: error.message
    });
  }
});

// @desc    Get project statistics
// @route   GET /api/projects/stats
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const stats = await Project.getDashboardStats();

    // Additional statistics
    const recentProjects = await Project.find()
      .populate('submittedBy', 'fullName organization')
      .sort({ createdAt: -1 })
      .limit(5);

    const topRegions = await Project.aggregate([
      {
        $group: {
          _id: '$region',
          count: { $sum: 1 },
          totalCredits: { $sum: '$credits' },
          totalArea: { $sum: '$area' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats,
        recentProjects,
        topRegions
      }
    });

  } catch (error) {
    console.error('Get project statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project statistics',
      error: error.message
    });
  }
});

module.exports = router;