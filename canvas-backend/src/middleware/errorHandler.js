const logger = require('../utils/logger');

const errorHandler = (error, req, res, next) => {
  logger.error('Unhandled error:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Canvas API errors
  if (error.message.includes('Canvas API Error')) {
    return res.status(502).json({
      error: 'Canvas API Error',
      message: 'Failed to communicate with Canvas LMS',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: error.message,
      details: error.details
    });
  }

  // Database errors
  if (error.code === 'SQLITE_CONSTRAINT') {
    return res.status(409).json({
      error: 'Conflict',
      message: 'Resource already exists or constraint violation'
    });
  }

  // Authentication errors
  if (error.name === 'UnauthorizedError' || error.message.includes('token')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired authentication token'
    });
  }

  // Rate limiting errors
  if (error.message.includes('rate limit')) {
    return res.status(429).json({
      error: 'Rate Limit Exceeded',
      message: 'Too many requests. Please try again later.'
    });
  }

  // Default server error
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    timestamp: new Date().toISOString()
  });
};

module.exports = errorHandler;