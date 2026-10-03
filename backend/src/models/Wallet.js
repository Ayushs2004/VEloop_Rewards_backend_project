const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    ves: {
      type: Number,
      default: 0,
      min: [0, 'VEs balance cannot be negative']
    },
    sves: {
      type: Number,
      default: 0,
      min: [0, 'SVEs balance cannot be negative']
    },
    gems: {
      type: Number,
      default: 0,
      min: [0, 'Gems balance cannot be negative']
    },
    tokens: {
      type: Number,
      default: 0,
      min: [0, 'Tokens balance cannot be negative']
    },
    spins: {
      type: Number,
      default: 0,
      min: [0, 'Spins balance cannot be negative']
    }
  },
  {
    timestamps: true
  }
);

walletSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;
