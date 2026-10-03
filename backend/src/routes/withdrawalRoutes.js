const express = require('express');
const router = express.Router();
const withdrawalController = require('../controllers/withdrawalController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { withdrawalLimiter } = require('../middleware/rateLimiter');
const {
  createWithdrawalValidator,
  rejectWithdrawalValidator,
  approveWithdrawalValidator
} = require('../validators/withdrawalValidator');
const { USER_ROLES } = require('../config/constants');

// User Withdrawal endpoints
router.post(
  '/',
  authenticate,
  withdrawalLimiter,
  createWithdrawalValidator,
  withdrawalController.createWithdrawal
);

router.get('/', authenticate, withdrawalController.getWithdrawals);
router.get('/:id', authenticate, withdrawalController.getWithdrawalById);

// Admin-only review endpoints
router.patch(
  '/:id/approve',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  approveWithdrawalValidator,
  withdrawalController.approveWithdrawal
);

router.patch(
  '/:id/reject',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  rejectWithdrawalValidator,
  withdrawalController.rejectWithdrawal
);

module.exports = router;
