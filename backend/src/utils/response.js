/**
 * Standardized API response utilities
 */

const sendSuccess = (res, statusCode = 200, message = 'Success', data = null, meta = null) => {
  const payload = {
    success: true,
    message,
    data: data !== null ? data : {}
  };

  if (meta) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
};

const sendError = (res, statusCode = 400, message = 'An error occurred', code = 'BAD_REQUEST', errors = null) => {
  const payload = {
    success: false,
    message,
    code
  };

  if (errors) {
    payload.errors = errors;
  }

  return res.status(statusCode).json(payload);
};

module.exports = {
  sendSuccess,
  sendError
};
