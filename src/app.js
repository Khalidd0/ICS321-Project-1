// ============================================
// EXPRESS APP CONFIGURATION
// ============================================
// This file sets up Express with middleware, routes, and static UI
const path = require('path');
const express = require('express');
const cors = require('cors');
const app = express();

// Import error handler
const errorHandler = require('./middleware/errorHandler');

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors()); // Allow frontend access (safe for same-origin)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Optional request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ============================================
// STATIC FRONTEND (UI)
// ============================================
// Serve everything inside /public (your HTML, CSS, JS)
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

// ============================================
// API ROUTES
// ============================================
// Keep API under /api to separate from UI
app.get('/api', (req, res) => {
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

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// Mount route modules
const guestRoutes = require('./routes/guestRoutes');
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/guest', guestRoutes);
app.use('/api/admin', adminRoutes);

// ============================================
// SPA/STATIC FALLBACK
// ============================================
// If someone goes to /admin_dashboard.html etc., serve index.html
app.get(/^\/(?!api\/).*/, (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// ============================================
// ERROR HANDLING
// ============================================
// 404 handler (for API only)
app.use(/^\/api(\/|$)/, (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.url
  });
});

// Global error handler
app.use(errorHandler);

// ============================================
// EXPORT APP
// ============================================
module.exports = app;
