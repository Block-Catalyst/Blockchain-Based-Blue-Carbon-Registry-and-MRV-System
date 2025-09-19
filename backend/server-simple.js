const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

const app = express();

// Basic middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blue_carbon_mrv');
    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    // Don't exit process, continue without DB for now
  }
};

connectDB();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Blue Carbon MRV Backend is running',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Sample data endpoint (matches your frontend expectations)
app.get('/api/projects', (req, res) => {
  const sampleProjects = [
    {
      id: 1,
      name: "Mangrove Restoration A",
      organization: "Green Earth NGO",
      region: "Chennai Coast",
      area: 50,
      method: "plantation",
      vintage: 2023,
      credits: 1200,
      description: "Community-led mangrove plantation in coastal zone A.",
      image: "/images/admin/project1.jpg",
      status: "pending",
    },
    {
      id: 2,
      name: "Coastal Cleanup B",
      organization: "Blue Ocean Trust",
      region: "Marina Beach",
      area: 30,
      method: "natural_regeneration",
      vintage: 2022,
      credits: 800,
      description: "Plastic waste cleanup initiative with local schools.",
      image: "/images/admin/project2.jpg",
      status: "approved",
    },
    {
      id: 3,
      name: "Wetland Protection C",
      organization: "EcoCare",
      region: "Delta Zone",
      area: 20,
      method: "mixed",
      vintage: 2021,
      credits: 500,
      description: "Protecting and restoring wetlands in delta region.",
      image: "/images/admin/project3.jpg",
      status: "rejected",
    }
  ];

  res.json({
    success: true,
    data: {
      projects: sampleProjects,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: 3
      }
    }
  });
});

// Sample login endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;

  // Simple hardcoded authentication
  if (role === 'admin' && email === 'admin@example.com' && password === 'admin123') {
    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        user: {
          _id: 'admin',
          email: 'admin@example.com',
          role: 'admin',
          fullName: 'Admin User'
        },
        token: 'sample_admin_token'
      }
    });
  } else if (role === 'field' && email === 'john@greenearthngo.org' && password === 'password123') {
    res.json({
      success: true,
      message: 'Field user login successful',
      data: {
        user: {
          _id: 'field_user_1',
          email: 'john@greenearthngo.org',
          role: 'field',
          fullName: 'John Doe',
          organization: 'Green Earth NGO'
        },
        token: 'sample_field_token'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// Sample register endpoint
app.post('/api/auth/register', (req, res) => {
  const { fullName, email, password, organization, phone, location } = req.body;

  // Simple validation
  if (!fullName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields'
    });
  }

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        _id: 'new_user_' + Date.now(),
        fullName,
        email,
        role: 'field',
        organization,
        phone,
        location
      },
      token: 'sample_new_user_token'
    }
  });
});

// Sample dashboard stats
app.get('/api/dashboard/overview', (req, res) => {
  res.json({
    success: true,
    data: {
      overview: {
        totalProjects: 6,
        totalCredits: 7150,
        totalArea: 320,
        avgCredits: 1191,
        byStatus: {
          pending: { count: 2, totalCredits: 1500, totalArea: 90 },
          approved: { count: 3, totalCredits: 4700, totalArea: 180 },
          rejected: { count: 1, totalCredits: 0, totalArea: 20 },
          verified: { count: 1, totalCredits: 950, totalArea: 30 }
        }
      },
      trends: {
        monthly: [
          { _id: { year: 2023, month: 11 }, count: 2, credits: 2000 },
          { _id: { year: 2023, month: 10 }, count: 1, credits: 800 },
          { _id: { year: 2023, month: 9 }, count: 3, credits: 4350 }
        ],
        regions: [
          { _id: "Chennai Coast", projectCount: 1, totalCredits: 1200, totalArea: 50 },
          { _id: "Marina Beach", projectCount: 1, totalCredits: 800, totalArea: 30 },
          { _id: "Andaman Islands", projectCount: 1, totalCredits: 2200, totalArea: 80 }
        ]
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Frontend should connect to: http://localhost:${PORT}`);
});