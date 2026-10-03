const express = require('express');
const router = express.Router();
const payoutController = require('../controllers/payoutController');
const authenticate = require('../middleware/auth');

// Payout catalogue endpoints (can be accessed by authenticated users)
router.get('/methods', authenticate, payoutController.getPayoutMethods);
router.get('/options/:method', authenticate, payoutController.getPayoutOptionsByMethod);

module.exports = router;
