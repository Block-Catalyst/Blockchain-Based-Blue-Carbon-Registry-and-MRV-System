const express = require('express');
const Project = require('../models/Project');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// @desc    Get dashboard overview statistics
// @route   GET /api/dashboard/overview
// @access  Public
router.get('/overview', async (req, res) => {
  try {
    // Get project statistics
    const projectStats = await Project.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalCredits: { $sum: '$credits' },
          totalArea: { $sum: '$area' }
        }
      }
    ]);

    // Get overall totals
    const overallStats = await Project.aggregate([
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          totalCredits: { $sum: '$credits' },
          totalArea: { $sum: '$area' },
          avgArea: { $avg: '$area' },
          avgCredits: { $avg: '$credits' }
        }
      }
    ]);

    // Get monthly project creation trend
    const monthlyTrend = await Project.aggregate([
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
      {
        $sort: { '_id.year': -1, '_id.month': -1 }
      },
      {
        $limit: 12
      }
    ]);

    // Get top performing regions
    const topRegions = await Project.aggregate([
      {
        $match: { status: { $in: ['approved', 'verified'] } }
      },
      {
        $group: {
          _id: '$region',
          projectCount: { $sum: 1 },
          totalCredits: { $sum: '$credits' },
          totalArea: { $sum: '$area' }
        }
      },
      {
        $sort: { totalCredits: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Get method distribution
    const methodDistribution = await Project.aggregate([
      {
        $group: {
          _id: '$method',
          count: { $sum: 1 },
          totalCredits: { $sum: '$credits' }
        }
      }
    ]);

    // Format response
    const formattedProjectStats = projectStats.reduce((acc, stat) => {
      acc[stat._id] = {
        count: stat.count,
        totalCredits: stat.totalCredits,
        totalArea: stat.totalArea
      };
      return acc;
    }, {});

    const overall = overallStats[0] || {
      totalProjects: 0,
      totalCredits: 0,
      totalArea: 0,
      avgArea: 0,
      avgCredits: 0
    };

    res.json({
      success: true,
      data: {
        overview: {
          ...overall,
          byStatus: formattedProjectStats
        },
        trends: {
          monthly: monthlyTrend,
          regions: topRegions,
          methods: methodDistribution
        }
      }
    });

  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
});

// @desc    Get carbon credits statistics
// @route   GET /api/dashboard/carbon-stats
// @access  Public
router.get('/carbon-stats', async (req, res) => {
  try {
    // Credits by status
    const creditsByStatus = await Project.aggregate([
      {
        $group: {
          _id: '$status',
          totalCredits: { $sum: '$credits' },
          avgCredits: { $avg: '$credits' },
          projectCount: { $sum: 1 }
        }
      }
    ]);

    // Credits by vintage year
    const creditsByVintage = await Project.aggregate([
      {
        $match: { credits: { $gt: 0 } }
      },
      {
        $group: {
          _id: '$vintage',
          totalCredits: { $sum: '$credits' },
          projectCount: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Credits by method
    const creditsByMethod = await Project.aggregate([
      {
        $match: { credits: { $gt: 0 } }
      },
      {
        $group: {
          _id: '$method',
          totalCredits: { $sum: '$credits' },
          avgCreditsPerHectare: { $avg: { $divide: ['$credits', '$area'] } },
          projectCount: { $sum: 1 }
        }
      }
    ]);

    // Top organizations by credits
    const topOrganizations = await Project.aggregate([
      {
        $match: { credits: { $gt: 0 } }
      },
      {
        $group: {
          _id: '$organization',
          totalCredits: { $sum: '$credits' },
          projectCount: { $sum: 1 },
          totalArea: { $sum: '$area' }
        }
      },
      {
        $sort: { totalCredits: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      data: {
        byStatus: creditsByStatus,
        byVintage: creditsByVintage,
        byMethod: creditsByMethod,
        topOrganizations
      }
    });

  } catch (error) {
    console.error('Carbon stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch carbon statistics',
      error: error.message
    });
  }
});

// @desc    Get user dashboard (Private)
// @route   GET /api/dashboard/user
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's projects
    const userProjects = await Project.find({ submittedBy: userId })
      .sort({ createdAt: -1 });

    // Calculate user statistics
    const userStats = {
      totalProjects: userProjects.length,
      projectsByStatus: userProjects.reduce((acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
      }, {}),
      totalCredits: userProjects.reduce((sum, project) => sum + (project.credits || 0), 0),
      totalArea: userProjects.reduce((sum, project) => sum + project.area, 0),
      avgCreditsPerHectare: 0
    };

    if (userStats.totalArea > 0) {
      userStats.avgCreditsPerHectare = userStats.totalCredits / userStats.totalArea;
    }

    // Get recent activity (milestones, status changes)
    const recentActivity = [];
    userProjects.forEach(project => {
      // Add project creation
      recentActivity.push({
        type: 'project_created',
        date: project.createdAt,
        description: `Created project: ${project.name}`,
        projectId: project._id,
        projectName: project.name
      });

      // Add recent status changes
      if (project.reviewComments && project.reviewComments.length > 0) {
        const latestComment = project.reviewComments[project.reviewComments.length - 1];
        recentActivity.push({
          type: 'status_change',
          date: latestComment.reviewedAt,
          description: `Project ${project.name} status changed to ${project.status}`,
          projectId: project._id,
          projectName: project.name,
          status: project.status
        });
      }

      // Add completed milestones
      if (project.milestones) {
        project.milestones.forEach(milestone => {
          if (milestone.status === 'completed' && milestone.completedDate) {
            recentActivity.push({
              type: 'milestone_completed',
              date: milestone.completedDate,
              description: `Completed milestone: ${milestone.title}`,
              projectId: project._id,
              projectName: project.name
            });
          }
        });
      }
    });

    // Sort by date (most recent first) and limit to 10
    recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));
    const limitedActivity = recentActivity.slice(0, 10);

    // Get pending tasks/milestones
    const pendingTasks = [];
    userProjects.forEach(project => {
      if (project.milestones) {
        project.milestones.forEach(milestone => {
          if (['pending', 'in_progress'].includes(milestone.status)) {
            pendingTasks.push({
              milestoneId: milestone._id,
              title: milestone.title,
              status: milestone.status,
              targetDate: milestone.targetDate,
              projectId: project._id,
              projectName: project.name
            });
          }
        });
      }
    });

    res.json({
      success: true,
      data: {
        statistics: userStats,
        projects: userProjects,
        recentActivity: limitedActivity,
        pendingTasks
      }
    });

  } catch (error) {
    console.error('User dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user dashboard data',
      error: error.message
    });
  }
});

// @desc    Get admin dashboard statistics
// @route   GET /api/dashboard/admin
// @access  Private (Admin only)
router.get('/admin', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    // Get all projects requiring review
    const pendingReviews = await Project.find({ status: 'pending' })
      .populate('submittedBy', 'fullName email organization')
      .sort({ createdAt: 1 });

    // Get user statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent registrations
    const recentUsers = await User.find()
      .select('fullName email organization createdAt role')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get projects needing attention (delayed, etc.)
    const delayedProjects = await Project.find({
      'milestones.status': 'delayed'
    }).populate('submittedBy', 'fullName email organization');

    // System health metrics
    const systemHealth = {
      totalUsers: await User.countDocuments(),
      activeUsers: await User.countDocuments({ isActive: true }),
      totalProjects: await Project.countDocuments(),
      pendingReviews: pendingReviews.length,
      verifiedProjects: await Project.countDocuments({ status: 'verified' }),
      totalCreditsIssued: await Project.aggregate([
        {
          $match: { status: { $in: ['approved', 'verified'] } }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$credits' }
          }
        }
      ])
    };

    const creditsIssued = systemHealth.totalCreditsIssued[0]?.total || 0;

    res.json({
      success: true,
      data: {
        systemHealth: {
          ...systemHealth,
          totalCreditsIssued: creditsIssued
        },
        pendingReviews,
        userStats,
        recentUsers,
        delayedProjects
      }
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin dashboard data',
      error: error.message
    });
  }
});

// @desc    Get regional statistics
// @route   GET /api/dashboard/regional-stats
// @access  Public
router.get('/regional-stats', async (req, res) => {
  try {
    const regionalStats = await Project.aggregate([
      {
        $group: {
          _id: '$region',
          projectCount: { $sum: 1 },
          totalArea: { $sum: '$area' },
          totalCredits: { $sum: '$credits' },
          avgCredits: { $avg: '$credits' },
          statusBreakdown: {
            $push: {
              status: '$status',
              credits: '$credits'
            }
          }
        }
      },
      {
        $project: {
          region: '$_id',
          projectCount: 1,
          totalArea: 1,
          totalCredits: 1,
          avgCredits: 1,
          approved: {
            $size: {
              $filter: {
                input: '$statusBreakdown',
                cond: { $eq: ['$$this.status', 'approved'] }
              }
            }
          },
          verified: {
            $size: {
              $filter: {
                input: '$statusBreakdown',
                cond: { $eq: ['$$this.status', 'verified'] }
              }
            }
          },
          pending: {
            $size: {
              $filter: {
                input: '$statusBreakdown',
                cond: { $eq: ['$$this.status', 'pending'] }
              }
            }
          }
        }
      },
      {
        $sort: { totalCredits: -1 }
      }
    ]);

    res.json({
      success: true,
      data: { regionalStats }
    });

  } catch (error) {
    console.error('Regional stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch regional statistics',
      error: error.message
    });
  }
});

// @desc    Get time-series data for charts
// @route   GET /api/dashboard/time-series
// @access  Public
router.get('/time-series', async (req, res) => {
  try {
    const { period = '12months', metric = 'credits' } = req.query;

    let dateRange = {};
    let groupBy = {};

    // Define date range and grouping based on period
    switch (period) {
      case '30days':
        dateRange = {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        };
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
        break;
      case '6months':
        dateRange = {
          createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) }
        };
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        break;
      default: // 12months
        dateRange = {
          createdAt: { $gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000) }
        };
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
    }

    const timeSeriesData = await Project.aggregate([
      { $match: dateRange },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
          credits: { $sum: '$credits' },
          area: { $sum: '$area' }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.day': 1
        }
      }
    ]);

    res.json({
      success: true,
      data: { timeSeriesData }
    });

  } catch (error) {
    console.error('Time series error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch time series data',
      error: error.message
    });
  }
});

module.exports = router;