const mongoose = require('mongoose');
const { WITHDRAWAL_STATUS, PAYOUT_METHODS, CURRENCIES } = require('../config/constants');

const withdrawalSchema = new mongoose.Schema(
  {
    withdrawalId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    method: {
      type: String,
      enum: Object.values(PAYOUT_METHODS),
      required: true,
      index: true
    },
    optionId: {
      type: String,
      required: true,
      index: true
    },
    currency: {
      type: String,
      default: CURRENCIES.VES,
      required: true
    },
    currencyAmount: {
      type: Number,
      required: true,
      min: [1, 'Currency amount must be at least 1']
    },
    payoutAmount: {
      type: Number,
      required: true,
      min: [0.01, 'Payout amount must be greater than zero']
    },
    payoutCurrency: {
      type: String,
      default: 'INR'
    },
    payoutDetails: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(WITHDRAWAL_STATUS),
      default: WITHDRAWAL_STATUS.PENDING,
      index: true
    },
    rejectionReason: {
      type: String,
      default: null
    },
    reviewNote: {
      type: String,
      default: null
    },
    transactionId: {
      type: String,
      required: true,
      index: true
    },
    idempotencyKey: {
      type: String,
      index: true,
      default: null
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    processedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound index for idempotency per user
withdrawalSchema.index(
  { userId: 1, idempotencyKey: 1 },
  { unique: true, sparse: true }
);

// Compound indexes for history filtering
withdrawalSchema.index({ userId: 1, createdAt: -1 });
withdrawalSchema.index({ status: 1, createdAt: -1 });

withdrawalSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  // Mask sensitive payout details partially if needed, keeping domain audit clean
  if (obj.payoutDetails && obj.payoutDetails.upiId) {
    const parts = obj.payoutDetails.upiId.split('@');
    if (parts.length === 2 && parts[0].length > 3) {
      obj.payoutDetails = {
        ...obj.payoutDetails,
        maskedUpiId: `${parts[0].slice(0, 2)}***@${parts[1]}`
      };
    }
  }
  return obj;
};

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);

module.exports = Withdrawal;
