// ============================================
// GLOBAL ERROR HANDLER
// ============================================
// This middleware catches ALL errors in the app

/**
 * Error Handler Middleware
 * 
 * This function runs whenever an error occurs in:
 * - Controllers
 * - Routes
 * - Any middleware
 * 
 * It formats the error and sends a proper response
 */

function errorHandler(err, req, res, next) {
  // Log error to console (for debugging)
  console.error('❌ Error occurred:');
  console.error('Message:', err.message);
  console.error('Stack:', err.stack);
  
  // Determine status code
  const statusCode = err.statusCode || err.status || 500;
  
  // Prepare error response
  const response = {
    success: false,
    message: err.message || 'Internal Server Error',
    path: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  };
  
  // Include stack trace only in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }
  
  // Send error response
  res.status(statusCode).json(response);
}

module.exports = errorHandler;