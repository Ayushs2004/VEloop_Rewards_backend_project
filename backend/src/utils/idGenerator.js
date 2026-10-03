const { v4: uuidv4 } = require('uuid');

/**
 * Generate human-readable unique IDs for transactions and withdrawals
 */
const generateTransactionId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = uuidv4().split('-')[0].toUpperCase();
  return `TXN_${timestamp}_${random}`;
};

const generateWithdrawalId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = uuidv4().split('-')[0].toUpperCase();
  return `WTH_${timestamp}_${random}`;
};

const generateAuditId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = uuidv4().split('-')[0].toUpperCase();
  return `AUD_${timestamp}_${random}`;
};

module.exports = {
  generateTransactionId,
  generateWithdrawalId,
  generateAuditId
};
