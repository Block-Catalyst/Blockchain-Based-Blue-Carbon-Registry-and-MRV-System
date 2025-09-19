// Simple test server to check if basic setup works
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Blue Carbon MRV Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      res.json({
        status: 'OK',
        message: 'Database connection successful',
        database: mongoose.connection.name
      });
    } else {
      res.status(500).json({
        status: 'ERROR',
        message: 'MONGODB_URI not configured'
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    status: 'ERROR',
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});