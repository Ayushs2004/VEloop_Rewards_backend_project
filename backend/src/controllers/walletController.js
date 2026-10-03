const walletService = require('../services/walletService');
const auditService = require('../services/auditService');
const { sendSuccess } = require('../utils/response');
const { AUDIT_ACTIONS, TRANSACTION_SOURCES } = require('../config/constants');

/**
 * Fetch authenticated user's wallet
 * Note: userId is derived strictly from JWT (req.user.id)
 */
const getWallet = async (req, res, next) => {
  try {
    const wallet = await walletService.getWallet(req.user.id);
    return sendSuccess(res, 200, 'Wallet fetched successfully.', wallet);
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch authenticated user's wallet summary & metrics
 */
const getWalletSummary = async (req, res, next) => {
  try {
    const summary = await walletService.getWalletSummary(req.user.id);
    return sendSuccess(res, 200, 'Wallet summary fetched successfully.', summary);
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch paginated transaction history for authenticated user
 */
const getTransactions = async (req, res, next) => {
  try {
    const { page, limit, currency, type } = req.query;
    const result = await walletService.getTransactions(req.user.id, {
      page,
      limit,
      currency,
      type
    });

    return sendSuccess(
      res,
      200,
      'Transactions fetched successfully.',
      result.transactions,
      result.pagination
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Admin endpoint: Credit a user's wallet
 */
const creditWallet = async (req, res, next) => {
  try {
    const { userId, currency, amount, source, description, metadata } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await walletService.creditWallet({
      userId,
      currency,
      amount: parseFloat(amount),
      source: source || TRANSACTION_SOURCES.ADMIN_CREDIT,
      description: description || `Admin balance adjustment credit by ${req.user.email}`,
      metadata: {
        adminId: req.user.id,
        ...metadata
      }
    });

    // Record audit log
    await auditService.logAction({
      actorId: req.user.id,
      action: AUDIT_ACTIONS.WALLET_CREDIT,
      targetUserId: userId,
      targetType: 'WALLET',
      referenceId: result.transaction.transactionId,
      metadata: {
        amount,
        currency: result.transaction.currency,
        newBalance: result.wallet.ves
      },
      ip,
      userAgent
    });

    return sendSuccess(res, 200, 'Wallet credited successfully.', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin endpoint: Debit a user's wallet
 */
const debitWallet = async (req, res, next) => {
  try {
    const { userId, currency, amount, source, description, metadata } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await walletService.debitWallet({
      userId,
      currency,
      amount: parseFloat(amount),
      source: source || TRANSACTION_SOURCES.ADMIN_DEBIT,
      description: description || `Admin balance adjustment debit by ${req.user.email}`,
      metadata: {
        adminId: req.user.id,
        ...metadata
      }
    });

    // Record audit log
    await auditService.logAction({
      actorId: req.user.id,
      action: AUDIT_ACTIONS.WALLET_DEBIT,
      targetUserId: userId,
      targetType: 'WALLET',
      referenceId: result.transaction.transactionId,
      metadata: {
        amount,
        currency: result.transaction.currency,
        newBalance: result.wallet.ves
      },
      ip,
      userAgent
    });

    return sendSuccess(res, 200, 'Wallet debited successfully.', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWallet,
  getWalletSummary,
  getTransactions,
  creditWallet,
  debitWallet
};
