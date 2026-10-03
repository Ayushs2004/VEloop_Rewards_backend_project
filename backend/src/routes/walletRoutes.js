const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { walletMutationLimiter } = require('../middleware/rateLimiter');
const { walletMutationValidator } = require('../validators/walletValidator');
const { USER_ROLES } = require('../config/constants');

// User Wallet endpoints (Identity strictly derived from JWT)
router.get('/', authenticate, walletController.getWallet);
router.get('/summary', authenticate, walletController.getWalletSummary);
router.get('/transactions', authenticate, walletController.getTransactions);

// Internal/Admin Mutation endpoints
router.post(
  '/credit',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  walletMutationLimiter,
  walletMutationValidator,
  walletController.creditWallet
);

router.post(
  '/debit',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  walletMutationLimiter,
  walletMutationValidator,
  walletController.debitWallet
);

module.exports = router;
