const rateLimit = require('express-rate-limit');
const env = require('../config/env');
const { sendError } = require('../utils/response');

const isTest = process.env.NODE_ENV === 'test';

const createLimiter = (windowMs, max, message, code = 'RATE_LIMIT_EXCEEDED') => {
  if (isTest) {
    // Pass-through during testing
    return (req, res, next) => next();
  }

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      sendError(res, 429, message, code);
    }
  });
};

const apiLimiter = createLimiter(
  env.RATE_LIMIT_WINDOW_MS,
  env.RATE_LIMIT_MAX_REQUESTS,
  'Too many requests from this IP. Please try again later.'
);

const authLimiter = createLimiter(
  15 * 60 * 1000,
  env.AUTH_RATE_LIMIT_MAX,
  'Too many authentication attempts. Please try again after 15 minutes.',
  'AUTH_RATE_LIMIT_EXCEEDED'
);

const withdrawalLimiter = createLimiter(
  10 * 60 * 1000,
  env.WITHDRAWAL_RATE_LIMIT_MAX,
  'Too many withdrawal attempts. Please wait a few minutes before trying again.',
  'WITHDRAWAL_RATE_LIMIT_EXCEEDED'
);

const walletMutationLimiter = createLimiter(
  5 * 60 * 1000,
  50,
  'Too many balance adjustment requests. Please slow down.',
  'MUTATION_RATE_LIMIT_EXCEEDED'
);

module.exports = {
  apiLimiter,
  authLimiter,
  withdrawalLimiter,
  walletMutationLimiter
};
