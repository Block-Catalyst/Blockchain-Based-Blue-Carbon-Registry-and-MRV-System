const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [200, 'Project name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  organization: {
    type: String,
    required: [true, 'Organization is required'],
    trim: true,
    maxlength: [200, 'Organization name cannot exceed 200 characters']
  },
  submittedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Project must have a submitter']
  },
  region: {
    type: String,
    required: [true, 'Region is required'],
    trim: true,
    maxlength: [100, 'Region cannot exceed 100 characters']
  },
  area: {
    type: Number,
    required: [true, 'Area is required'],
    min: [0.1, 'Area must be at least 0.1 hectares'],
    max: [10000, 'Area cannot exceed 10,000 hectares']
  },
  method: {
    type: String,
    required: [true, 'Method is required'],
    enum: {
      values: ['plantation', 'natural_regeneration', 'mixed'],
      message: 'Method must be plantation, natural_regeneration, or mixed'
    }
  },
  vintage: {
    type: Number,
    required: [true, 'Vintage year is required'],
    min: [2000, 'Vintage year must be after 2000'],
    max: [new Date().getFullYear() + 5, 'Vintage year cannot be more than 5 years in the future']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'approved', 'rejected', 'verified', 'under_review'],
      message: 'Status must be pending, approved, rejected, verified, or under_review'
    },
    default: 'pending'
  },
  credits: {
    type: Number,
    default: 0,
    min: [0, 'Credits cannot be negative']
  },
  estimatedCredits: {
    type: Number,
    default: 0,
    min: [0, 'Estimated credits cannot be negative']
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  documents: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    fileName: String,
    fileType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    }
  },
  geoData: {
    type: mongoose.Schema.Types.Mixed,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return v.type === 'FeatureCollection' || v.type === 'Feature';
      },
      message: 'GeoData must be valid GeoJSON'
    }
  },
  speciesMix: [{
    species: {
      type: String,
      required: true,
      trim: true
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    }
  }],
  milestones: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    targetDate: Date,
    completedDate: Date,
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'delayed'],
      default: 'pending'
    },
    evidence: [{
      url: String,
      publicId: String,
      description: String
    }]
  }],
  reviewComments: [{
    comment: {
      type: String,
      required: true
    },
    reviewedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    reviewedAt: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['approval', 'rejection', 'revision_request'],
      required: true
    }
  }],
  verificationData: {
    verifiedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    verificationMethod: {
      type: String,
      enum: ['satellite', 'drone', 'ground_survey', 'mixed']
    },
    verificationReport: String,
    confidence: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  carbonData: {
    soilCarbon: Number,
    biomassCarbon: Number,
    totalCarbon: Number,
    carbonPerHectare: Number,
    measurementDate: Date,
    measurementMethod: String
  },
  biodiversityMetrics: {
    speciesCount: Number,
    endemicSpecies: Number,
    threatenedSpecies: Number,
    surveyDate: Date
  },
  socialImpact: {
    communitiesInvolved: Number,
    jobsCreated: Number,
    beneficiaries: Number,
    genderDistribution: {
      male: Number,
      female: Number,
      other: Number
    }
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  tags: [String],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  lastUpdatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for project age in days
projectSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for credits per hectare
projectSchema.virtual('creditsPerHectare').get(function() {
  return this.area > 0 ? Math.round((this.credits / this.area) * 100) / 100 : 0;
});

// Virtual for completion percentage
projectSchema.virtual('completionPercentage').get(function() {
  if (!this.milestones || this.milestones.length === 0) return 0;
  
  const completedMilestones = this.milestones.filter(m => m.status === 'completed').length;
  return Math.round((completedMilestones / this.milestones.length) * 100);
});

// Pre-save middleware to calculate estimated credits
projectSchema.pre('save', function(next) {
  if (this.isNew || this.isModified(['area', 'method', 'vintage'])) {
    // Simple carbon credit estimation formula
    // This should be replaced with actual scientific calculations
    let baseCredits = 0;
    
    switch (this.method) {
      case 'plantation':
        baseCredits = this.area * 15; // 15 credits per hectare for plantation
        break;
      case 'natural_regeneration':
        baseCredits = this.area * 12; // 12 credits per hectare for natural regeneration
        break;
      case 'mixed':
        baseCredits = this.area * 13.5; // 13.5 credits per hectare for mixed approach
        break;
    }
    
    // Adjust for vintage (newer projects get slightly lower initial estimates)
    const currentYear = new Date().getFullYear();
    const yearsSinceVintage = currentYear - this.vintage;
    const vintageMultiplier = Math.min(1, 0.7 + (yearsSinceVintage * 0.1));
    
    this.estimatedCredits = Math.round(baseCredits * vintageMultiplier);
  }
  next();
});

// Static method to get projects by status
projectSchema.statics.getByStatus = function(status) {
  return this.find({ status }).populate('submittedBy', 'fullName email organization');
};

// Static method to get projects with credits
projectSchema.statics.getProjectsWithCredits = function() {
  return this.find({ 
    credits: { $gt: 0 },
    status: { $in: ['approved', 'verified'] }
  }).populate('submittedBy', 'fullName email organization');
};

// Static method for dashboard statistics
projectSchema.statics.getDashboardStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalCredits: { $sum: '$credits' },
        totalArea: { $sum: '$area' }
      }
    }
  ]);
  
  const totalStats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalProjects: { $sum: 1 },
        totalCredits: { $sum: '$credits' },
        totalArea: { $sum: '$area' },
        averageCreditsPerHectare: { $avg: { $divide: ['$credits', '$area'] } }
      }
    }
  ]);
  
  return {
    byStatus: stats,
    overall: totalStats[0] || {
      totalProjects: 0,
      totalCredits: 0,
      totalArea: 0,
      averageCreditsPerHectare: 0
    }
  };
};

// Method to add milestone
projectSchema.methods.addMilestone = function(milestone) {
  this.milestones.push(milestone);
  return this.save();
};

// Method to update milestone status
projectSchema.methods.updateMilestoneStatus = function(milestoneId, status, evidence = null) {
  const milestone = this.milestones.id(milestoneId);
  if (milestone) {
    milestone.status = status;
    if (status === 'completed') {
      milestone.completedDate = new Date();
    }
    if (evidence) {
      milestone.evidence.push(evidence);
    }
  }
  return this.save();
};

// Indexes for better query performance
projectSchema.index({ status: 1 });
projectSchema.index({ submittedBy: 1 });
projectSchema.index({ region: 1 });
projectSchema.index({ vintage: 1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ location: '2dsphere' });
projectSchema.index({ 'tags': 1 });
projectSchema.index({ 'isPublic': 1 });

module.exports = mongoose.model('Project', projectSchema);