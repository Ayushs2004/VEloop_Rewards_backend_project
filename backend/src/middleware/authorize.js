const { sendError } = require('../utils/response');

/**
 * Role-based authorization middleware
 * @param  {...string} allowedRoles
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required.', 'UNAUTHORIZED');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        'Access denied. You do not have permissions for this resource.',
        'FORBIDDEN'
      );
    }

    next();
  };
};

module.exports = authorize;
