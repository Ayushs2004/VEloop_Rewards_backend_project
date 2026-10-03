const bcrypt = require('bcryptjs');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const Withdrawal = require('../models/Withdrawal');
const PayoutOption = require('../models/PayoutOption');
const AuditLog = require('../models/AuditLog');
const {
  USER_ROLES,
  ACCOUNT_STATUS,
  CURRENCIES,
  TRANSACTION_TYPES,
  TRANSACTION_SOURCES,
  TRANSACTION_STATUS,
  PAYOUT_METHODS,
  WITHDRAWAL_STATUS,
  AUDIT_ACTIONS
} = require('../config/constants');
const { generateTransactionId, generateWithdrawalId, generateAuditId } = require('../utils/idGenerator');

const seedData = async (shouldDisconnect = false) => {
  try {
    console.log('[Seed] Connecting to database...');
    await connectDB();

    console.log('[Seed] Clearing existing demo collections...');
    await Promise.all([
      User.deleteMany({ email: { $in: ['demo@veloop.test', 'admin@veloop.test', 'seconduser@veloop.test'] } }),
      PayoutOption.deleteMany({}),
      AuditLog.deleteMany({})
    ]);

    // 1. Create Demo User
    const userSalt = await bcrypt.genSalt(10);
    const userPasswordHash = await bcrypt.hash('Password123!', userSalt);

    const demoUser = new User({
      email: 'demo@veloop.test',
      passwordHash: userPasswordHash,
      name: 'Demo User (VELoop)',
      accountStatus: ACCOUNT_STATUS.ACTIVE,
      role: USER_ROLES.USER
    });
    await demoUser.save();
    console.log(`[Seed] Created Demo User: ${demoUser.email} (Password: Password123!)`);

    // Clean up wallet and transactions for demoUser._id if any
    await Wallet.deleteMany({ userId: demoUser._id });
    await WalletTransaction.deleteMany({ userId: demoUser._id });
    await Withdrawal.deleteMany({ userId: demoUser._id });

    // 2. Create Demo User Wallet (25,000 VEs, 5,000 SVEs, 100 Gems, 500 Tokens, 3 Spins)
    const demoWallet = new Wallet({
      userId: demoUser._id,
      ves: 25000,
      sves: 5000,
      gems: 100,
      tokens: 500,
      spins: 3
    });
    await demoWallet.save();
    console.log(`[Seed] Initialized Demo Wallet for ${demoUser.email}: VEs=25,000, SVEs=5,000, Gems=100, Tokens=500, Spins=3`);

    // 3. Create Sample Ledger Transactions matching the 25,000 VEs balance
    // Ledger reconstruction:
    // 0 + 14000 (Bonus) = 14000
    // 14000 + 10000 (Referral) = 24000
    // 24000 + 500 (Ad Reward) = 24500
    // 24500 + 300 (Game Reward) = 24800
    // 24800 + 200 (Daily Reward) = 25000
    const ledgerEntries = [
      {
        transactionId: generateTransactionId(),
        userId: demoUser._id,
        currency: CURRENCIES.VES,
        type: TRANSACTION_TYPES.CREDIT,
        amount: 14000,
        balanceBefore: 0,
        balanceAfter: 14000,
        source: TRANSACTION_SOURCES.BONUS,
        status: TRANSACTION_STATUS.SUCCESS,
        description: 'Welcome Sign-up Bonus',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        transactionId: generateTransactionId(),
        userId: demoUser._id,
        currency: CURRENCIES.VES,
        type: TRANSACTION_TYPES.CREDIT,
        amount: 10000,
        balanceBefore: 14000,
        balanceAfter: 24000,
        source: TRANSACTION_SOURCES.REFERRAL,
        status: TRANSACTION_STATUS.SUCCESS,
        description: 'Referral Reward: Friend joined via your link',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        transactionId: generateTransactionId(),
        userId: demoUser._id,
        currency: CURRENCIES.VES,
        type: TRANSACTION_TYPES.CREDIT,
        amount: 500,
        balanceBefore: 24000,
        balanceAfter: 24500,
        source: TRANSACTION_SOURCES.AD_REWARD,
        status: TRANSACTION_STATUS.SUCCESS,
        description: 'Sponsored Video Ad Engagement Reward',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        transactionId: generateTransactionId(),
        userId: demoUser._id,
        currency: CURRENCIES.VES,
        type: TRANSACTION_TYPES.CREDIT,
        amount: 300,
        balanceBefore: 24500,
        balanceAfter: 24800,
        source: TRANSACTION_SOURCES.GAME_REWARD,
        status: TRANSACTION_STATUS.SUCCESS,
        description: 'Trivia Quest Challenge Victory Reward',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        transactionId: generateTransactionId(),
        userId: demoUser._id,
        currency: CURRENCIES.VES,
        type: TRANSACTION_TYPES.CREDIT,
        amount: 200,
        balanceBefore: 24800,
        balanceAfter: 25000,
        source: TRANSACTION_SOURCES.DAILY_REWARD,
        status: TRANSACTION_STATUS.SUCCESS,
        description: 'Consecutive Daily Check-in Streak Reward',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
      }
    ];

    await WalletTransaction.insertMany(ledgerEntries);
    console.log(`[Seed] Inserted ${ledgerEntries.length} verified historical ledger transactions.`);

    // 4. Create Demo Admin User
    const adminSalt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('AdminPass123!', adminSalt);

    const demoAdmin = new User({
      email: 'admin@veloop.test',
      passwordHash: adminPasswordHash,
      name: 'System Administrator (VELoop)',
      accountStatus: ACCOUNT_STATUS.ACTIVE,
      role: USER_ROLES.ADMIN
    });
    await demoAdmin.save();

    await Wallet.deleteMany({ userId: demoAdmin._id });
    const adminWallet = new Wallet({
      userId: demoAdmin._id,
      ves: 100000,
      sves: 20000,
      gems: 500,
      tokens: 1000,
      spins: 10
    });
    await adminWallet.save();
    console.log(`[Seed] Created Demo Admin: ${demoAdmin.email} (Password: AdminPass123!)`);

    // 5. Create Second Demo User (for testing unauthorized access between users)
    const secondUserPasswordHash = await bcrypt.hash('Password123!', userSalt);
    const secondUser = new User({
      email: 'seconduser@veloop.test',
      passwordHash: secondUserPasswordHash,
      name: 'Second Test User',
      accountStatus: ACCOUNT_STATUS.ACTIVE,
      role: USER_ROLES.USER
    });
    await secondUser.save();

    await Wallet.deleteMany({ userId: secondUser._id });
    const secondWallet = new Wallet({
      userId: secondUser._id,
      ves: 5000,
      sves: 1000,
      gems: 20,
      tokens: 100,
      spins: 1
    });
    await secondWallet.save();
    console.log(`[Seed] Created Second User: ${secondUser.email} (for multi-tenant isolation testing)`);

    // 6. Seed Payout Options into MongoDB
    // Denominations exactly matching specification:
    // ₹10 = 2,400 VEs
    // ₹25 = 5,800 VEs
    // ₹50 = 10,000 VEs
    // ₹100 = 19,500 VEs
    // ₹150 = 28,500 VEs
    // ₹300 = 52,500 VEs
    // ₹500 = 80,500 VEs
    // ₹1000 = 150,000 VEs
    const payoutOptionsList = [
      // --- UPI OPTIONS ---
      {
        optionId: 'upi_10',
        method: PAYOUT_METHODS.UPI,
        name: '₹10 Instant UPI Transfer',
        type: 'UPI_DIRECT',
        currency: CURRENCIES.VES,
        payoutValue: 10,
        payoutCurrency: 'INR',
        requiredAmount: 2400,
        active: true,
        eligibility: { minTier: 'BRONZE' }
      },
      {
        optionId: 'upi_25',
        method: PAYOUT_METHODS.UPI,
        name: '₹25 Instant UPI Transfer',
        type: 'UPI_DIRECT',
        currency: CURRENCIES.VES,
        payoutValue: 25,
        payoutCurrency: 'INR',
        requiredAmount: 5800,
        active: true,
        eligibility: { minTier: 'BRONZE' }
      },
      {
        optionId: 'upi_50',
        method: PAYOUT_METHODS.UPI,
        name: '₹50 Instant UPI Transfer',
        type: 'UPI_DIRECT',
        currency: CURRENCIES.VES,
        payoutValue: 50,
        payoutCurrency: 'INR',
        requiredAmount: 10000,
        active: true,
        eligibility: { minTier: 'SILVER' }
      },
      {
        optionId: 'upi_100',
        method: PAYOUT_METHODS.UPI,
        name: '₹100 Instant UPI Transfer',
        type: 'UPI_DIRECT',
        currency: CURRENCIES.VES,
        payoutValue: 100,
        payoutCurrency: 'INR',
        requiredAmount: 19500,
        active: true,
        eligibility: { minTier: 'SILVER' }
      },
      {
        optionId: 'upi_150',
        method: PAYOUT_METHODS.UPI,
        name: '₹150 Instant UPI Transfer',
        type: 'UPI_DIRECT',
        currency: CURRENCIES.VES,
        payoutValue: 150,
        payoutCurrency: 'INR',
        requiredAmount: 28500,
        active: true,
        eligibility: { minTier: 'GOLD' }
      },
      {
        optionId: 'upi_300',
        method: PAYOUT_METHODS.UPI,
        name: '₹300 Instant UPI Transfer',
        type: 'UPI_DIRECT',
        currency: CURRENCIES.VES,
        payoutValue: 300,
        payoutCurrency: 'INR',
        requiredAmount: 52500,
        active: true,
        eligibility: { minTier: 'GOLD' }
      },
      {
        optionId: 'upi_500',
        method: PAYOUT_METHODS.UPI,
        name: '₹500 Instant UPI Transfer',
        type: 'UPI_DIRECT',
        currency: CURRENCIES.VES,
        payoutValue: 500,
        payoutCurrency: 'INR',
        requiredAmount: 80500,
        active: true,
        eligibility: { minTier: 'PLATINUM' }
      },
      {
        optionId: 'upi_1000',
        method: PAYOUT_METHODS.UPI,
        name: '₹1,000 Instant UPI Transfer',
        type: 'UPI_DIRECT',
        currency: CURRENCIES.VES,
        payoutValue: 1000,
        payoutCurrency: 'INR',
        requiredAmount: 150000,
        active: true,
        eligibility: { minTier: 'PLATINUM' }
      },
      // --- PAYPAL OPTIONS ---
      {
        optionId: 'paypal_1',
        method: PAYOUT_METHODS.PAYPAL,
        name: '$1 USD PayPal Cashout',
        type: 'PAYPAL_DIRECT',
        currency: CURRENCIES.VES,
        payoutValue: 1,
        payoutCurrency: 'USD',
        requiredAmount: 8500,
        active: true,
        eligibility: { minTier: 'SILVER' }
      },
      {
        optionId: 'paypal_5',
        method: PAYOUT_METHODS.PAYPAL,
        name: '$5 USD PayPal Cashout',
        type: 'PAYPAL_DIRECT',
        currency: CURRENCIES.VES,
        payoutValue: 5,
        payoutCurrency: 'USD',
        requiredAmount: 42000,
        active: true,
        eligibility: { minTier: 'GOLD' }
      },
      {
        optionId: 'paypal_10',
        method: PAYOUT_METHODS.PAYPAL,
        name: '$10 USD PayPal Cashout',
        type: 'PAYPAL_DIRECT',
        currency: CURRENCIES.VES,
        payoutValue: 10,
        payoutCurrency: 'USD',
        requiredAmount: 80000,
        active: true,
        eligibility: { minTier: 'PLATINUM' }
      },
      // --- AMAZON GIFT CARD OPTIONS ---
      {
        optionId: 'amazon_50',
        method: PAYOUT_METHODS.AMAZON_GIFT_CARD,
        name: '₹50 Amazon Gift Voucher',
        type: 'GIFT_CARD',
        currency: CURRENCIES.VES,
        payoutValue: 50,
        payoutCurrency: 'INR',
        requiredAmount: 10000,
        active: true,
        eligibility: { minTier: 'SILVER' }
      },
      {
        optionId: 'amazon_100',
        method: PAYOUT_METHODS.AMAZON_GIFT_CARD,
        name: '₹100 Amazon Gift Voucher',
        type: 'GIFT_CARD',
        currency: CURRENCIES.VES,
        payoutValue: 100,
        payoutCurrency: 'INR',
        requiredAmount: 19500,
        active: true,
        eligibility: { minTier: 'SILVER' }
      },
      {
        optionId: 'amazon_250',
        method: PAYOUT_METHODS.AMAZON_GIFT_CARD,
        name: '₹250 Amazon Gift Voucher',
        type: 'GIFT_CARD',
        currency: CURRENCIES.VES,
        payoutValue: 250,
        payoutCurrency: 'INR',
        requiredAmount: 46000,
        active: true,
        eligibility: { minTier: 'GOLD' }
      },
      {
        optionId: 'amazon_500',
        method: PAYOUT_METHODS.AMAZON_GIFT_CARD,
        name: '₹500 Amazon Gift Voucher',
        type: 'GIFT_CARD',
        currency: CURRENCIES.VES,
        payoutValue: 500,
        payoutCurrency: 'INR',
        requiredAmount: 80500,
        active: true,
        eligibility: { minTier: 'PLATINUM' }
      },
      // --- GOOGLE PLAY GIFT CARD OPTIONS ---
      {
        optionId: 'googleplay_10',
        method: PAYOUT_METHODS.GOOGLE_PLAY_GIFT_CARD,
        name: '₹10 Google Play Code',
        type: 'GIFT_CARD',
        currency: CURRENCIES.VES,
        payoutValue: 10,
        payoutCurrency: 'INR',
        requiredAmount: 2400,
        active: true,
        eligibility: { minTier: 'BRONZE' }
      },
      {
        optionId: 'googleplay_50',
        method: PAYOUT_METHODS.GOOGLE_PLAY_GIFT_CARD,
        name: '₹50 Google Play Code',
        type: 'GIFT_CARD',
        currency: CURRENCIES.VES,
        payoutValue: 50,
        payoutCurrency: 'INR',
        requiredAmount: 10000,
        active: true,
        eligibility: { minTier: 'SILVER' }
      },
      {
        optionId: 'googleplay_100',
        method: PAYOUT_METHODS.GOOGLE_PLAY_GIFT_CARD,
        name: '₹100 Google Play Code',
        type: 'GIFT_CARD',
        currency: CURRENCIES.VES,
        payoutValue: 100,
        payoutCurrency: 'INR',
        requiredAmount: 19500,
        active: true,
        eligibility: { minTier: 'SILVER' }
      },
      // --- INACTIVE TEST OPTION (FOR NEGATIVE TEST VALIDATION) ---
      {
        optionId: 'upi_inactive_test',
        method: PAYOUT_METHODS.UPI,
        name: '₹2,000 UPI Transfer (Maintenance/Inactive)',
        type: 'UPI_DIRECT',
        currency: CURRENCIES.VES,
        payoutValue: 2000,
        payoutCurrency: 'INR',
        requiredAmount: 300000,
        active: false,
        eligibility: { minTier: 'VIP' }
      }
    ];

    await PayoutOption.insertMany(payoutOptionsList);
    console.log(`[Seed] Seeded ${payoutOptionsList.length} database-driven payout options across UPI, PayPal, Amazon, and Google Play.`);

    // 7. Initial Audit Log
    const seedAudit = new AuditLog({
      auditId: generateAuditId(),
      actorId: demoAdmin._id,
      action: AUDIT_ACTIONS.PAYOUT_CONFIG_CHANGED,
      targetUserId: demoAdmin._id,
      targetType: 'SYSTEM',
      referenceId: 'SEED_INITIALIZATION',
      metadata: {
        totalOptionsSeeded: payoutOptionsList.length,
        version: '1.0.0'
      }
    });
    await seedAudit.save();

    console.log('[Seed] Database seeding completed successfully!');
  } catch (error) {
    console.error('[Seed] Seeding failed:', error);
    if (shouldDisconnect) process.exit(1);
    throw error;
  } finally {
    if (shouldDisconnect) {
      await disconnectDB();
    }
  }
};

if (require.main === module) {
  seedData(true);
}

module.exports = seedData;
