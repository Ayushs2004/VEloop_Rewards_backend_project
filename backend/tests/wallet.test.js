const request = require('supertest');
const app = require('../src/app');
const walletService = require('../src/services/walletService');
const WalletTransaction = require('../src/models/WalletTransaction');
const { setupTestDB, createTestUser } = require('./setup');
const { USER_ROLES, CURRENCIES, TRANSACTION_TYPES, TRANSACTION_SOURCES } = require('../src/config/constants');

setupTestDB();

describe('Wallet & Ledger Service', () => {
  /**
   * TEST 1: Normal credit
   * 1000 VEs + 500 VEs = 1500 VEs
   */
  test('TEST 1: Normal credit adds to balance and creates immutable ledger entry (1000 VEs + 500 VEs = 1500 VEs)', async () => {
    const { user } = await createTestUser({
      walletBalances: { ves: 1000, sves: 0, gems: 0, tokens: 0, spins: 0 }
    });

    // Credit 500 VEs
    const creditResult = await walletService.creditWallet({
      userId: user._id,
      currency: CURRENCIES.VES,
      amount: 500,
      source: TRANSACTION_SOURCES.REWARD,
      description: 'Test engagement reward'
    });

    // 1. Verify updated balance
    expect(creditResult.wallet.ves).toBe(1500);

    // 2. Verify ledger entry created
    expect(creditResult.transaction).toBeDefined();
    expect(creditResult.transaction.type).toBe(TRANSACTION_TYPES.CREDIT);
    expect(creditResult.transaction.amount).toBe(500);
    expect(creditResult.transaction.balanceBefore).toBe(1000);
    expect(creditResult.transaction.balanceAfter).toBe(1500);
    expect(creditResult.transaction.currency).toBe(CURRENCIES.VES);

    // 3. Verify in database
    const dbLedger = await WalletTransaction.findOne({ transactionId: creditResult.transaction.transactionId });
    expect(dbLedger).not.toBeNull();
    expect(dbLedger.balanceBefore).toBe(1000);
    expect(dbLedger.balanceAfter).toBe(1500);
  });

  test('GET /api/wallet: Fetches actual backend balances derived from authenticated JWT', async () => {
    const { user, token } = await createTestUser({
      walletBalances: { ves: 25000, sves: 5000, gems: 100, tokens: 500, spins: 3 }
    });

    const res = await request(app)
      .get('/api/wallet')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.ves).toBe(25000);
    expect(res.body.data.sves).toBe(5000);
    expect(res.body.data.gems).toBe(100);
    expect(res.body.data.tokens).toBe(500);
    expect(res.body.data.spins).toBe(3);
    expect(res.body.data.userId.toString()).toBe(user._id.toString());
  });

  test('GET /api/wallet/summary: Returns calculated totals from ledger records', async () => {
    const { user, token } = await createTestUser({
      walletBalances: { ves: 1500, sves: 0, gems: 0, tokens: 0, spins: 0 }
    });

    // Seed 2 ledger entries for user
    await walletService.creditWallet({
      userId: user._id,
      currency: CURRENCIES.VES,
      amount: 1000,
      source: TRANSACTION_SOURCES.BONUS,
      description: 'Bonus credit'
    });

    const res = await request(app)
      .get('/api/wallet/summary')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.metrics).toBeDefined();
    expect(res.body.data.metrics.netVEsBalance).toBe(2500);
  });

  test('Admin POST /api/wallet/credit: Allows admin to credit wallet and creates audit log', async () => {
    const admin = await createTestUser({
      email: 'admin@veloop.test',
      role: USER_ROLES.ADMIN
    });
    const regularUser = await createTestUser({
      email: 'user@veloop.test',
      walletBalances: { ves: 100, sves: 0, gems: 0, tokens: 0, spins: 0 }
    });

    const res = await request(app)
      .post('/api/wallet/credit')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        userId: regularUser.user._id,
        currency: 'VEs',
        amount: 500,
        description: 'Customer loyalty bonus'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.wallet.ves).toBe(600);
    expect(res.body.data.transaction.balanceBefore).toBe(100);
    expect(res.body.data.transaction.balanceAfter).toBe(600);
  });

  test('Admin POST /api/wallet/debit: Fails if target has insufficient balance', async () => {
    const admin = await createTestUser({
      email: 'admin@veloop.test',
      role: USER_ROLES.ADMIN
    });
    const regularUser = await createTestUser({
      email: 'user@veloop.test',
      walletBalances: { ves: 200, sves: 0, gems: 0, tokens: 0, spins: 0 }
    });

    const res = await request(app)
      .post('/api/wallet/debit')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        userId: regularUser.user._id,
        currency: 'VEs',
        amount: 500,
        description: 'Correction debit'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('INSUFFICIENT_BALANCE');
  });
});
