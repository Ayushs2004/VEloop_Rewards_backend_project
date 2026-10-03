const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const walletService = require('./walletService');
const auditService = require('./auditService');
const env = require('../config/env');
const { USER_ROLES, ACCOUNT_STATUS, AUDIT_ACTIONS } = require('../config/constants');

/**
 * Generate a signed JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      status: user.accountStatus
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN
    }
  );
};

/**
 * Register a new user account
 */
const register = async ({ email, password, name, role = USER_ROLES.USER, ip = null, userAgent = null }) => {
  const normalizedEmail = String(email).trim().toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    const error = new Error('An account with this email address already exists.');
    error.code = 'EMAIL_ALREADY_EXISTS';
    error.statusCode = 409;
    throw error;
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = new User({
    email: normalizedEmail,
    passwordHash,
    name: String(name).trim(),
    role: role === USER_ROLES.ADMIN ? USER_ROLES.ADMIN : USER_ROLES.USER,
    accountStatus: ACCOUNT_STATUS.ACTIVE
  });

  await user.save();

  // Initialize an empty wallet for the user
  const wallet = await walletService.getWallet(user._id);

  // Record audit log
  await auditService.logAction({
    actorId: user._id,
    action: AUDIT_ACTIONS.USER_REGISTERED,
    targetUserId: user._id,
    targetType: 'USER',
    referenceId: user._id.toString(),
    ip,
    userAgent
  });

  const token = generateToken(user);

  return {
    user,
    wallet,
    token
  };
};

/**
 * Login user with credentials
 */
const login = async ({ email, password, ip = null, userAgent = null }) => {
  const normalizedEmail = String(email).trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    const error = new Error('Invalid email or password.');
    error.code = 'INVALID_CREDENTIALS';
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    const error = new Error('Invalid email or password.');
    error.code = 'INVALID_CREDENTIALS';
    error.statusCode = 401;
    throw error;
  }

  if (user.accountStatus !== ACCOUNT_STATUS.ACTIVE) {
    const error = new Error(`Account is currently ${user.accountStatus.toLowerCase()}. Contact support.`);
    error.code = 'ACCOUNT_RESTRICTED';
    error.statusCode = 403;
    throw error;
  }

  const token = generateToken(user);
  const wallet = await walletService.getWallet(user._id);

  // Record audit log
  await auditService.logAction({
    actorId: user._id,
    action: AUDIT_ACTIONS.USER_LOGIN,
    targetUserId: user._id,
    targetType: 'USER',
    referenceId: user._id.toString(),
    ip,
    userAgent
  });

  return {
    user,
    wallet,
    token
  };
};

/**
 * Fetch profile of authenticated user
 */
const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found.');
    error.code = 'USER_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }

  const wallet = await walletService.getWallet(userId);

  return {
    user,
    wallet
  };
};

module.exports = {
  register,
  login,
  getMe,
  generateToken
};
