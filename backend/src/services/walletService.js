const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const { CURRENCIES, TRANSACTION_TYPES, TRANSACTION_SOURCES, TRANSACTION_STATUS } = require('../config/constants');
const { generateTransactionId } = require('../utils/idGenerator');

/**
 * Maps currency enum/string to wallet schema field name
 */
const currencyToField = (currency) => {
  const normalized = String(currency).trim().toLowerCase();
  switch (normalized) {
    case 'ves':
    case 've':
      return { field: 'ves', enumValue: CURRENCIES.VES };
    case 'sves':
    case 'sve':
      return { field: 'sves', enumValue: CURRENCIES.SVES };
    case 'gems':
    case 'gem':
      return { field: 'gems', enumValue: CURRENCIES.GEMS };
    case 'tokens':
    case 'token':
      return { field: 'tokens', enumValue: CURRENCIES.TOKENS };
    case 'spins':
    case 'spin':
      return { field: 'spins', enumValue: CURRENCIES.SPINS };
    default:
      throw new Error(`Unsupported currency: ${currency}`);
  }
};

/**
 * Fetch or initialize a user's wallet
 */
const getWallet = async (userId, session = null) => {
  const query = Wallet.findOne({ userId });
  if (session) query.session(session);

  let wallet = await query;
  if (!wallet) {
    // Create new empty wallet for the user if it doesn't exist
    const newWallet = new Wallet({
      userId,
      ves: 0,
      sves: 0,
      gems: 0,
      tokens: 0,
      spins: 0
    });
    if (session) {
      wallet = await newWallet.save({ session });
    } else {
      wallet = await newWallet.save();
    }
  }
  return wallet;
};

/**
 * Get comprehensive wallet summary with ledger aggregates
 */
const getWalletSummary = async (userId) => {
  const wallet = await getWallet(userId);

  // Aggregate total earned and redeemed VEs from ledger
  const totals = await WalletTransaction.aggregate([
    { $match: { userId: wallet.userId, currency: CURRENCIES.VES, status: TRANSACTION_STATUS.SUCCESS } },
    {
      $group: {
        _id: '$type',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  let totalCredited = 0;
  let totalDebited = 0;

  totals.forEach((item) => {
    if (item._id === TRANSACTION_TYPES.CREDIT) {
      totalCredited = item.totalAmount;
    } else if (item._id === TRANSACTION_TYPES.DEBIT) {
      totalDebited = item.totalAmount;
    }
  });

  return {
    wallet,
    metrics: {
      totalCreditedVEs: totalCredited,
      totalDebitedVEs: totalDebited,
      netVEsBalance: wallet.ves
    }
  };
};

/**
 * Validate that a user has at least the required amount of currency
 */
const validateBalance = async (userId, currency, requiredAmount, session = null) => {
  const { field } = currencyToField(currency);
  const wallet = await getWallet(userId, session);

  if (!wallet || wallet[field] < requiredAmount) {
    return {
      isValid: false,
      currentBalance: wallet ? wallet[field] : 0,
      requiredAmount,
      currency
    };
  }

  return {
    isValid: true,
    currentBalance: wallet[field],
    requiredAmount,
    currency
  };
};

/**
 * Create a ledger entry in WalletTransaction
 */
const createLedgerEntry = async ({
  userId,
  currency,
  type,
  amount,
  balanceBefore,
  balanceAfter,
  source,
  referenceId = null,
  description,
  metadata = {},
  session = null
}) => {
  const transaction = new WalletTransaction({
    transactionId: generateTransactionId(),
    userId,
    currency,
    type,
    amount,
    balanceBefore,
    balanceAfter,
    source,
    referenceId,
    status: TRANSACTION_STATUS.SUCCESS,
    description,
    metadata
  });

  if (session) {
    await transaction.save({ session });
  } else {
    await transaction.save();
  }

  return transaction;
};

/**
 * Credit a user's wallet and write to the immutable ledger
 */
const creditWallet = async ({
  userId,
  currency = CURRENCIES.VES,
  amount,
  source = TRANSACTION_SOURCES.BONUS,
  referenceId = null,
  description = 'Wallet credited',
  metadata = {},
  session = null
}) => {
  if (!amount || amount <= 0) {
    const error = new Error('Credit amount must be greater than zero');
    error.code = 'INVALID_AMOUNT';
    error.statusCode = 400;
    throw error;
  }

  const { field, enumValue } = currencyToField(currency);

  // Fetch current wallet to record balanceBefore
  const currentWallet = await getWallet(userId, session);
  const balanceBefore = currentWallet[field];

  // Atomically increment the wallet balance
  const updateQuery = Wallet.findOneAndUpdate(
    { userId },
    { $inc: { [field]: amount } },
    { new: true, upsert: true }
  );
  if (session) updateQuery.session(session);
  const updatedWallet = await updateQuery;

  const balanceAfter = updatedWallet[field];

  // Record ledger entry
  const ledger = await createLedgerEntry({
    userId,
    currency: enumValue,
    type: TRANSACTION_TYPES.CREDIT,
    amount,
    balanceBefore,
    balanceAfter,
    source,
    referenceId,
    description,
    metadata,
    session
  });

  return {
    wallet: updatedWallet,
    transaction: ledger
  };
};

/**
 * Debit a user's wallet using atomic conditions to protect against race conditions
 */
const debitWallet = async ({
  userId,
  currency = CURRENCIES.VES,
  amount,
  source = TRANSACTION_SOURCES.WITHDRAWAL,
  referenceId = null,
  description = 'Wallet debited',
  metadata = {},
  session = null
}) => {
  if (!amount || amount <= 0) {
    const error = new Error('Debit amount must be greater than zero');
    error.code = 'INVALID_AMOUNT';
    error.statusCode = 400;
    throw error;
  }

  const { field, enumValue } = currencyToField(currency);

  // Fetch current wallet first for pre-check and balanceBefore calculation
  const currentWallet = await getWallet(userId, session);
  if (!currentWallet || currentWallet[field] < amount) {
    const error = new Error(`Insufficient ${enumValue} balance.`);
    error.code = 'INSUFFICIENT_BALANCE';
    error.statusCode = 400;
    error.data = {
      required: amount,
      available: currentWallet ? currentWallet[field] : 0,
      currency: enumValue
    };
    throw error;
  }

  // Atomic conditional decrement: Only updates if balance is still >= amount!
  // This guarantees race condition protection even under concurrent threads
  const updateQuery = Wallet.findOneAndUpdate(
    {
      userId,
      [field]: { $gte: amount }
    },
    {
      $inc: { [field]: -amount }
    },
    {
      new: true
    }
  );
  if (session) updateQuery.session(session);
  const updatedWallet = await updateQuery;

  if (!updatedWallet) {
    // Condition failed due to concurrent debit racing and consuming balance
    const error = new Error(`Insufficient ${enumValue} balance.`);
    error.code = 'INSUFFICIENT_BALANCE';
    error.statusCode = 400;
    throw error;
  }

  const balanceAfter = updatedWallet[field];
  const balanceBefore = balanceAfter + amount;

  // Create immutable ledger debit record
  const ledger = await createLedgerEntry({
    userId,
    currency: enumValue,
    type: TRANSACTION_TYPES.DEBIT,
    amount,
    balanceBefore,
    balanceAfter,
    source,
    referenceId,
    description,
    metadata,
    session
  });

  return {
    wallet: updatedWallet,
    transaction: ledger
  };
};

/**
 * Fetch paginated transaction history for a user
 */
const getTransactions = async (userId, { page = 1, limit = 20, currency = null, type = null } = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const filter = { userId };
  if (currency) {
    filter.currency = currency;
  }
  if (type) {
    filter.type = type;
  }

  const [transactions, total] = await Promise.all([
    WalletTransaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    WalletTransaction.countDocuments(filter)
  ]);

  return {
    transactions,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    }
  };
};

module.exports = {
  getWallet,
  getWalletSummary,
  validateBalance,
  creditWallet,
  debitWallet,
  createLedgerEntry,
  getTransactions,
  currencyToField
};
