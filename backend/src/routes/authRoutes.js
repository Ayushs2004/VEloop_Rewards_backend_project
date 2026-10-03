const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { registerValidator, loginValidator } = require('../validators/authValidator');

router.post('/register', authLimiter, registerValidator, authController.register);
router.post('/login', authLimiter, loginValidator, authController.login);
router.get('/me', authenticate, authController.getMe);

module.exports = router;
