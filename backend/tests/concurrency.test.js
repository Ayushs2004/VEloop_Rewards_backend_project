const request = require('supertest');
const app = require('../src/app');
const Wallet = require('../src/models/Wallet');
const Withdrawal = require('../src/models/Withdrawal');
const WalletTransaction = require('../src/models/WalletTransaction');
const { setupTestDB, createTestUser, seedTestPayoutOptions } = require('./setup');
const { TRANSACTION_TYPES } = require('../src/config/constants');

setupTestDB();

describe('Concurrency & Race Condition Protection', () => {
  beforeEach(async () => {
    await seedTestPayoutOptions();
  });

  /**
   * TEST 5: Concurrent withdrawals
   * Balance = 10,000 VEs
   * Request A = 8,000 VEs
   * Request B = 8,000 VEs
   * -> cannot both succeed!
   */
  test('TEST 5: Concurrent withdrawal requests prevent double spending; exactly one succeeds and one fails', async () => {
    // User has 10,000 VEs
    const { user, token } = await createTestUser({
      walletBalances: { ves: 10000, sves: 0, gems: 0, tokens: 0, spins: 0 }
    });

    // Fire Request A and Request B concurrently using Promise.all
    // Each requests 'upi_8000_race' (costs 8,000 VEs)
    const [resA, resB] = await Promise.all([
      request(app)
        .post('/api/withdrawals')
        .set('Authorization', `Bearer ${token}`)
        .send({
          method: 'UPI',
          optionId: 'upi_8000_race',
          payoutDetails: { upiId: 'race_a@okhdfcbank' }
        }),
      request(app)
        .post('/api/withdrawals')
        .set('Authorization', `Bearer ${token}`)
        .send({
          method: 'UPI',
          optionId: 'upi_8000_race',
          payoutDetails: { upiId: 'race_b@okhdfcbank' }
        })
    ]);

    const statuses = [resA.status, resB.status];
    const successes = statuses.filter((s) => s === 201).length;
    const failures = statuses.filter((s) => s === 400).length;

    // Exactly one request must succeed (201) and exactly one must fail (400)
    expect(successes).toBe(1);
    expect(failures).toBe(1);

    const failedResponse = resA.status === 400 ? resA : resB;
    expect(failedResponse.body.code).toBe('INSUFFICIENT_BALANCE');

    // Wallet balance must be exactly 10,000 - 8,000 = 2,000 VEs (NEVER negative!)
    const finalWallet = await Wallet.findOne({ userId: user._id });
    expect(finalWallet.ves).toBe(2000);

    // Only 1 withdrawal document created
    const totalWithdrawals = await Withdrawal.countDocuments({ userId: user._id });
    expect(totalWithdrawals).toBe(1);

    // Only 1 ledger debit created
    const totalDebits = await WalletTransaction.countDocuments({
      userId: user._id,
      type: TRANSACTION_TYPES.DEBIT
    });
    expect(totalDebits).toBe(1);
  });
});
