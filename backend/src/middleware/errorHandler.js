const { sendError } = require('../utils/response');

/**
 * Centralized application error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log unexpected errors internally for server observability
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);
  }

  // Handle explicitly thrown operational errors
  if (err.statusCode && err.statusCode < 500) {
    return sendError(res, err.statusCode, err.message, err.code || 'BAD_REQUEST', err.data || null);
  }

  // Handle Mongoose CastError (e.g. malformed ObjectId)
  if (err.name === 'CastError') {
    return sendError(
      res,
      400,
      `Invalid format for parameter: ${err.path}`,
      'INVALID_PARAM_FORMAT'
    );
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const formattedErrors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message
    }));
    return sendError(
      res,
      400,
      'Validation error occurred',
      'VALIDATION_ERROR',
      formattedErrors
    );
  }

  // Handle MongoDB duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return sendError(
      res,
      409,
      `A record with this ${field} already exists.`,
      'DUPLICATE_RECORD'
    );
  }

  // Generic 500 fallback - NEVER leak stack traces or raw database error strings to users
  return sendError(
    res,
    500,
    'An unexpected internal server error occurred. Please try again later.',
    'INTERNAL_SERVER_ERROR'
  );
};

module.exports = errorHandler;
