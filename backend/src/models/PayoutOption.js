const mongoose = require('mongoose');
const { PAYOUT_METHODS, CURRENCIES } = require('../config/constants');

const payoutOptionSchema = new mongoose.Schema(
  {
    optionId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    method: {
      type: String,
      enum: Object.values(PAYOUT_METHODS),
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'INSTANT_PAYOUT'
    },
    currency: {
      type: String,
      enum: Object.values(CURRENCIES),
      default: CURRENCIES.VES,
      required: true
    },
    payoutValue: {
      type: Number,
      required: true,
      min: 0.01
    },
    payoutCurrency: {
      type: String,
      default: 'INR'
    },
    requiredAmount: {
      type: Number,
      required: true,
      min: 1
    },
    active: {
      type: Boolean,
      default: true,
      index: true
    },
    eligibility: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        minimumTier: 'STANDARD',
        requiresKyc: false,
        countryCode: 'IN'
      }
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

payoutOptionSchema.index({ method: 1, active: 1 });

payoutOptionSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

const PayoutOption = mongoose.model('PayoutOption', payoutOptionSchema);

module.exports = PayoutOption;
