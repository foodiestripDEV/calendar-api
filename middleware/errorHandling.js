const secureErrorHandler = (error, req, res, next) => {
  // Log the full error for debugging (server-side only) important
  console.error('[ERROR]', {
    timestamp: new Date().toISOString(),
    error: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : 'Stack trace hidden in production',
    path: req.path,
    method: req.method,
    ip: req.ip,
    apiKey: req.apiKey?.substring(0, 8) + '***'
  });

  // Determine error type and safe response
  let statusCode = 500;
  let message = 'Internal server error';
  let errorCode = 'INTERNAL_ERROR';

  // Known error types with safe messages
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Invalid request data';
    errorCode = 'VALIDATION_ERROR';
  } else if (error.name === 'UnauthorizedError' || error.message?.includes('unauthorized')) {
    statusCode = 401;
    message = 'Authentication required';
    errorCode = 'UNAUTHORIZED';
  } else if (error.message?.includes('not found')) {
    statusCode = 404;
    message = 'Resource not found';
    errorCode = 'NOT_FOUND';
  } else if (error.message?.includes('rate limit')) {
    statusCode = 429;
    message = 'Too many requests';
    errorCode = 'RATE_LIMITED';
  } else if (error.message?.includes('quota')) {
    statusCode = 429;
    message = 'API quota exceeded';
    errorCode = 'QUOTA_EXCEEDED';
  } else if (error.statusCode) {
    statusCode = error.statusCode;
    message = error.statusCode < 500 ? error.message : 'Server error';
  }

  // Never expose sensitive information in production
  const response = {
    success: false,
    error: {
      code: errorCode,
      message: message,
      timestamp: new Date().toISOString(),
      requestId: req.id || generateRequestId()
    }
  };

  // Only add debug info in development
  if (process.env.NODE_ENV === 'development') {
    response.error.debug = {
      originalMessage: error.message,
      path: req.path,
      method: req.method
    };
  }

  res.status(statusCode).json(response);
};

// Generate unique request ID for tracking
const generateRequestId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Request ID middleware
const addRequestId = (req, res, next) => {
  req.id = generateRequestId();
  res.setHeader('X-Request-ID', req.id);
  next();
};

// 404 handler
const notFoundHandler = (req, res) => {
  console.warn(`[404] ${req.method} ${req.path} - IP: ${req.ip}`);
  
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested endpoint does not exist',
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
      requestId: req.id
    }
  });
};

module.exports = {
  secureErrorHandler,
  addRequestId,
  notFoundHandler
};