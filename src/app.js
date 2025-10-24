// ============================================
// EXPRESS APP CONFIGURATION
// ============================================
// This file sets up Express with middleware and routes

const express = require('express');
const app = express();

// Import error handler
const errorHandler = require('./middleware/errorHandler');

// ============================================
// MIDDLEWARE
// ============================================

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies (form data)
app.use(express.urlencoded({ extended: true }));

// Request logger (optional, but helpful)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ============================================
// ROUTES
// ============================================

// Home route
app.get('/', (req, res) => {
  res.json({
    message: '🐴 Welcome to Horse Racing API',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      guest: '/api/guest',
      admin: '/api/admin'
    }
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// API Routes
const guestRoutes = require('./routes/guestRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/guest', guestRoutes);
app.use('/api/admin', adminRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler - route not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.url
  });
});

// Global error handler (must be last!)
app.use(errorHandler);

// ============================================
// EXPORT APP
// ============================================

module.exports = app;