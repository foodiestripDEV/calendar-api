const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { 
  authenticateApiKey, 
  rateLimitByApiKey, 
  ipWhitelist, 
  securityLogger 
} = require('./middleware/security');
const { 
  sanitizeInput, 
  preventSQLInjection, 
  requestSizeLimiter 
} = require('./middleware/sanitization');
const { 
  secureErrorHandler, 
  addRequestId, 
  notFoundHandler 
} = require('./middleware/errorHandling');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1); // Trust first proxy for rate limiting it was "true" before

app.use(addRequestId);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

app.use(ipWhitelist);

app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Reduced from 100 to 50
  message: {
    success: false,
    error: 'Rate limit exceeded',
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: 900 // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: false, // Set to false for development
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  }
});
app.use(limiter);

// Request size limits
app.use(requestSizeLimiter);

// Body parsing with strict limits
app.use(express.json({ 
  limit: '1mb', // Reduced from 10mb
  strict: true
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '1mb'
}));

// Input sanitization
app.use(sanitizeInput);
app.use(preventSQLInjection); // Re-enabled with improved logic

app.use(morgan('combined'));

app.get('/', (req, res) => {
  res.json({
    message: 'Calendar API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    security: 'enabled'
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// Authentication required for all API routes
app.use('/api/*', authenticateApiKey);
app.use('/api/*', rateLimitByApiKey);
app.use('/api/*', securityLogger);

// Import and use API routes
const calendarRoutes = require('./routes/calendar');
const tasksRoutes = require('./routes/tasks');

// Mount routes
app.use('/api/calendar', calendarRoutes);
app.use('/api/tasks', tasksRoutes);

// 404 Handler
app.use('*', notFoundHandler);

// Global secure error handler
app.use(secureErrorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Calendar API Server is running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;