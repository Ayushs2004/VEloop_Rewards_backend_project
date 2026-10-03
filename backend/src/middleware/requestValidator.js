const { validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

/**
 * Middleware that inspects express-validator results and returns 400 if validation fails
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg
    }));

    return sendError(
      res,
      400,
      'Request validation failed',
      'VALIDATION_ERROR',
      formattedErrors
    );
  }
  next();
};

module.exports = validate;
