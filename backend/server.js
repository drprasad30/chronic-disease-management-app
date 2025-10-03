/**
 * Express Server for Chronic Disease Management App
 * 
 * Main server file that initializes and configures the application
 * with all routes, middleware, and database connections
 */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chronic-disease-mgmt', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

connectDB();

// Import routes
// Note: Create these route files in the routes/ directory
const patientRoutes = require('./routes/patients');
const kpiRoutes = require('./routes/kpi');
const recallRoutes = require('./routes/recalls');
const dashboardRoutes = require('./routes/dashboard');
const educationRoutes = require('./routes/education');

// API Routes
app.use('/api/patients', patientRoutes);
app.use('/api/kpi', kpiRoutes);
app.use('/api/recalls', recallRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/education', educationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Chronic Disease Management API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Chronic Disease Management API',
    version: '1.0.0',
    description: 'NHS QOF KPI tracking system for primary care',
    endpoints: {
      health: '/api/health',
      patients: '/api/patients',
      kpi: '/api/kpi',
      recalls: '/api/recalls',
      dashboard: '/api/dashboard',
      education: '/api/education'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
