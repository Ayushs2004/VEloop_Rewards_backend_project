const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { USER_ROLES } = require('../config/constants');

// Guard all admin routes
router.use(authenticate, authorize(USER_ROLES.ADMIN));

router.get('/stats', adminController.getAdminStats);
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
