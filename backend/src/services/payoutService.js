const PayoutOption = require('../models/PayoutOption');
const { PAYOUT_METHODS } = require('../config/constants');

// Metadata definitions for supported payout methods
const METHOD_METADATA = {
  [PAYOUT_METHODS.UPI]: {
    method: PAYOUT_METHODS.UPI,
    name: 'UPI (Unified Payments Interface)',
    description: 'Instant transfer to any VPA / UPI ID (Google Pay, PhonePe, Paytm, BHIM)',
    icon: 'upi',
    currency: 'INR',
    minimumPayout: 10,
    requiredFields: [
      {
        field: 'upiId',
        label: 'UPI ID / VPA',
        type: 'text',
        placeholder: 'username@okhdfcbank or 9876543210@paytm',
        regex: '^[a-zA-Z0-9.\\-_]{2,256}@[a-zA-Z]{2,64}$'
      }
    ]
  },
  [PAYOUT_METHODS.PAYPAL]: {
    method: PAYOUT_METHODS.PAYPAL,
    name: 'PayPal International',
    description: 'Direct transfer to your verified PayPal email address',
    icon: 'paypal',
    currency: 'USD',
    minimumPayout: 1,
    requiredFields: [
      {
        field: 'email',
        label: 'PayPal Account Email',
        type: 'email',
        placeholder: 'your-account@domain.com'
      }
    ]
  },
  [PAYOUT_METHODS.AMAZON_GIFT_CARD]: {
    method: PAYOUT_METHODS.AMAZON_GIFT_CARD,
    name: 'Amazon India Gift Card',
    description: 'Digital gift card claim code delivered to your registered email',
    icon: 'amazon',
    currency: 'INR',
    minimumPayout: 50,
    requiredFields: [
      {
        field: 'email',
        label: 'Delivery Email Address',
        type: 'email',
        placeholder: 'recipient@domain.com'
      }
    ]
  },
  [PAYOUT_METHODS.GOOGLE_PLAY_GIFT_CARD]: {
    method: PAYOUT_METHODS.GOOGLE_PLAY_GIFT_CARD,
    name: 'Google Play Gift Card',
    description: 'Digital redemption voucher for Google Play apps, games & subscriptions',
    icon: 'googleplay',
    currency: 'INR',
    minimumPayout: 10,
    requiredFields: [
      {
        field: 'email',
        label: 'Delivery Email Address',
        type: 'email',
        placeholder: 'recipient@domain.com'
      }
    ]
  }
};

/**
 * Fetch all available payout methods
 */
const getPayoutMethods = async () => {
  // Query distinct active methods present in PayoutOption collection
  const activeMethodsInDb = await PayoutOption.distinct('method', { active: true });

  const methodsList = Object.keys(METHOD_METADATA).map((key) => {
    const meta = METHOD_METADATA[key];
    const isAvailable = activeMethodsInDb.includes(meta.method);
    return {
      ...meta,
      active: isAvailable
    };
  });

  return methodsList;
};

/**
 * Fetch active options for a specific method
 */
const getPayoutOptionsByMethod = async (method) => {
  const normalizedMethod = String(method).trim().toUpperCase();

  const options = await PayoutOption.find({
    method: normalizedMethod,
    active: true
  })
    .sort({ payoutValue: 1 })
    .lean();

  return options;
};

/**
 * Find payout option by optionId
 */
const getPayoutOptionById = async (optionId) => {
  return PayoutOption.findOne({ optionId }).lean();
};

module.exports = {
  getPayoutMethods,
  getPayoutOptionsByMethod,
  getPayoutOptionById,
  METHOD_METADATA
};
