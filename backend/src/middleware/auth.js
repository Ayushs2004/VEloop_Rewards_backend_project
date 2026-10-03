const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { sendError } = require('../utils/response');

/**
 * Authentication middleware that verifies JWT and extracts authenticated user context
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 401, 'Authentication required. Missing or malformed token.', 'UNAUTHORIZED');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      status: decoded.status
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Session expired. Please log in again.', 'TOKEN_EXPIRED');
    }
    return sendError(res, 401, 'Invalid authentication token.', 'INVALID_TOKEN');
  }
};

module.exports = authenticate;
