const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Wallet = require('../src/models/Wallet');
const PayoutOption = require('../src/models/PayoutOption');
const env = require('../src/config/env');
const { USER_ROLES, ACCOUNT_STATUS, CURRENCIES, PAYOUT_METHODS } = require('../src/config/constants');

let mongoServer;

const setupTestDB = () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  afterEach(async () => {
    // Clear collections after each test to keep tests isolated
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });
};

const createTestUser = async ({
  email = null,
  password = 'Password123!',
  name = 'Test User',
  role = USER_ROLES.USER,
  status = ACCOUNT_STATUS.ACTIVE,
  walletBalances = { ves: 10000, sves: 1000, gems: 50, tokens: 100, spins: 2 }
} = {}) => {
  const userEmail = email || `test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}@veloop.test`;
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = new User({
    email: userEmail,
    passwordHash,
    name,
    role,
    accountStatus: status
  });
  await user.save();

  const wallet = new Wallet({
    userId: user._id,
    ...walletBalances
  });
  await wallet.save();

  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      status: user.accountStatus
    },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return { user, wallet, token };
};

const seedTestPayoutOptions = async () => {
  const options = [
    {
      optionId: 'upi_10',
      method: PAYOUT_METHODS.UPI,
      name: '₹10 Instant UPI',
      type: 'UPI_DIRECT',
      currency: CURRENCIES.VES,
      payoutValue: 10,
      payoutCurrency: 'INR',
      requiredAmount: 2400,
      active: true
    },
    {
      optionId: 'upi_50',
      method: PAYOUT_METHODS.UPI,
      name: '₹50 Instant UPI',
      type: 'UPI_DIRECT',
      currency: CURRENCIES.VES,
      payoutValue: 50,
      payoutCurrency: 'INR',
      requiredAmount: 10000,
      active: true
    },
    {
      optionId: 'upi_8000_race',
      method: PAYOUT_METHODS.UPI,
      name: 'Test ₹40 UPI (8000 VEs)',
      type: 'UPI_DIRECT',
      currency: CURRENCIES.VES,
      payoutValue: 40,
      payoutCurrency: 'INR',
      requiredAmount: 8000,
      active: true
    },
    {
      optionId: 'upi_1000_test',
      method: PAYOUT_METHODS.UPI,
      name: 'Test Option (1000 VEs)',
      type: 'UPI_DIRECT',
      currency: CURRENCIES.VES,
      payoutValue: 5,
      payoutCurrency: 'INR',
      requiredAmount: 1000,
      active: true
    },
    {
      optionId: 'paypal_1',
      method: PAYOUT_METHODS.PAYPAL,
      name: '$1 PayPal',
      type: 'PAYPAL_DIRECT',
      currency: CURRENCIES.VES,
      payoutValue: 1,
      payoutCurrency: 'USD',
      requiredAmount: 8500,
      active: true
    },
    {
      optionId: 'upi_inactive_test',
      method: PAYOUT_METHODS.UPI,
      name: 'Inactive Option',
      type: 'UPI_DIRECT',
      currency: CURRENCIES.VES,
      payoutValue: 100,
      payoutCurrency: 'INR',
      requiredAmount: 20000,
      active: false
    }
  ];

  await PayoutOption.insertMany(options);
};

module.exports = {
  setupTestDB,
  createTestUser,
  seedTestPayoutOptions
};
