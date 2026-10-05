const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const env = require('./config/env');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const { sendError, sendSuccess } = require('./utils/response');

// Import route modules
const authRoutes = require('./routes/authRoutes');
const walletRoutes = require('./routes/walletRoutes');
const payoutRoutes = require('./routes/payoutRoutes');
const withdrawalRoutes = require('./routes/withdrawalRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Security Headers
app.use(helmet());

// CORS configuration - allow frontend origin or open for local testing
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or matching CLIENT_URL
      if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
        return callback(null, true);
      }
      return callback(null, true); // Dev-friendly fallback
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'X-Idempotency-Key']
  })
);

// Body Parsing with size limits to prevent payload exhaustion
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));

// Normalize duplicate slashes in request URLs (e.g. //api/auth -> /api/auth)
app.use((req, res, next) => {
  if (req.url.includes('//')) {
    req.url = req.url.replace(/\/{2,}/g, '/');
  }
  next();
});

// Apply general API rate limiter
app.use('/api', apiLimiter);

// Welcome and root status endpoint
app.get('/', (req, res) => {
  return sendSuccess(res, 200, 'Welcome to VELoop Rewards Wallet & Withdrawal Backend API.', {
    service: 'VELoop Rewards API Service',
    status: 'ONLINE',
    version: '1.0.0',
    healthCheck: '/health',
    endpoints: {
      auth: '/api/auth',
      wallet: '/api/wallet',
      payout: '/api/payout',
      withdrawals: '/api/withdrawals',
      admin: '/api/admin'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  return sendSuccess(res, 200, 'VELoop Rewards API Service is operational.', {
    status: 'UP',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/payout', payoutRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/admin', adminRoutes);

// Catch-all for undefined routes
app.use('*', (req, res) => {
  return sendError(res, 404, `Endpoint ${req.originalUrl} not found on this server.`, 'NOT_FOUND');
});

// Centralized error handling middleware
app.use(errorHandler);

module.exports = app;
