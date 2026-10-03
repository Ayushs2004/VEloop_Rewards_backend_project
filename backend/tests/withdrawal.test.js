const request = require('supertest');
const app = require('../src/app');
const Wallet = require('../src/models/Wallet');
const Withdrawal = require('../src/models/Withdrawal');
const WalletTransaction = require('../src/models/WalletTransaction');
const { setupTestDB, createTestUser, seedTestPayoutOptions } = require('./setup');
const { USER_ROLES, WITHDRAWAL_STATUS, TRANSACTION_TYPES, TRANSACTION_SOURCES } = require('../src/config/constants');

setupTestDB();

describe('Withdrawal Flow, Validation & Idempotency', () => {
  beforeEach(async () => {
    await seedTestPayoutOptions();
  });

  /**
   * TEST 2: Normal withdrawal
   * 1500 VEs - 1000 VEs = 500 VEs
   */
  test('TEST 2: Normal withdrawal deducts correct required amount and transitions to PENDING (1500 VEs - 1000 VEs = 500 VEs)', async () => {
    const { user, token } = await createTestUser({
      walletBalances: { ves: 1500, sves: 0, gems: 0, tokens: 0, spins: 0 }
    });

    const res = await request(app)
      .post('/api/withdrawals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        method: 'UPI',
        optionId: 'upi_1000_test', // requires 1000 VEs
        payoutDetails: {
          upiId: 'testuser@okhdfcbank'
        }
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe(WITHDRAWAL_STATUS.PENDING);
    expect(res.body.data.currencyAmount).toBe(1000);
    expect(res.body.meta.remainingBalance).toBe(500);

    // Verify wallet in DB is now exactly 500 VEs
    const updatedWallet = await Wallet.findOne({ userId: user._id });
    expect(updatedWallet.ves).toBe(500);

    // Verify ledger DEBIT created
    const ledgerDebit = await WalletTransaction.findOne({
      userId: user._id,
      type: TRANSACTION_TYPES.DEBIT,
      referenceId: res.body.data.withdrawalId
    });
    expect(ledgerDebit).not.toBeNull();
    expect(ledgerDebit.balanceBefore).toBe(1500);
    expect(ledgerDebit.balanceAfter).toBe(500);
    expect(ledgerDebit.amount).toBe(1000);
    expect(ledgerDebit.source).toBe(TRANSACTION_SOURCES.WITHDRAWAL);
  });

  /**
   * TEST 3: Insufficient balance
   * 500 VEs balance, withdraw 1000 VEs -> rejected
   */
  test('TEST 3: Insufficient balance returns 400 and preserves balance without creating withdrawal', async () => {
    const { user, token } = await createTestUser({
      walletBalances: { ves: 500, sves: 0, gems: 0, tokens: 0, spins: 0 }
    });

    const res = await request(app)
      .post('/api/withdrawals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        method: 'UPI',
        optionId: 'upi_1000_test', // requires 1000 VEs
        payoutDetails: {
          upiId: 'testuser@okhdfcbank'
        }
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('INSUFFICIENT_BALANCE');
    expect(res.body.message).toMatch(/Insufficient VEs balance/i);

    // Ensure wallet balance is untouched (500)
    const wallet = await Wallet.findOne({ userId: user._id });
    expect(wallet.ves).toBe(500);

    // Ensure no withdrawal was recorded
    const withdrawalsCount = await Withdrawal.countDocuments({ userId: user._id });
    expect(withdrawalsCount).toBe(0);
  });

  /**
   * TEST 4: Double-click / duplicate withdrawal
   * Two identical requests with same Idempotency-Key -> only one deduction
   */
  test('TEST 4: Idempotency-Key prevents double-click duplicate withdrawals and double deduction', async () => {
    const { user, token } = await createTestUser({
      walletBalances: { ves: 10000, sves: 0, gems: 0, tokens: 0, spins: 0 }
    });

    const idempotencyKey = 'req_idempotency_unique_12345';

    // First request
    const res1 = await request(app)
      .post('/api/withdrawals')
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', idempotencyKey)
      .send({
        method: 'UPI',
        optionId: 'upi_10', // requires 2400 VEs
        payoutDetails: {
          upiId: 'shopper@axisbank'
        }
      });

    expect(res1.status).toBe(201);
    expect(res1.body.success).toBe(true);
    const firstWithdrawalId = res1.body.data.withdrawalId;

    // Check balance after first request: 10000 - 2400 = 7600
    const walletAfterFirst = await Wallet.findOne({ userId: user._id });
    expect(walletAfterFirst.ves).toBe(7600);

    // Second request with exact same Idempotency-Key (simulating user double-click)
    const res2 = await request(app)
      .post('/api/withdrawals')
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', idempotencyKey)
      .send({
        method: 'UPI',
        optionId: 'upi_10',
        payoutDetails: {
          upiId: 'shopper@axisbank'
        }
      });

    // Second response should return 200 with idempotent replay indicator
    expect(res2.status).toBe(200);
    expect(res2.body.data.withdrawalId).toBe(firstWithdrawalId);
    expect(res2.headers['x-idempotent-replay']).toBe('true');

    // Crucial check: Wallet was NOT deducted twice! Balance must STILL be 7600
    const walletAfterSecond = await Wallet.findOne({ userId: user._id });
    expect(walletAfterSecond.ves).toBe(7600);

    // Crucial check: Exactly ONE withdrawal was created
    const count = await Withdrawal.countDocuments({ userId: user._id });
    expect(count).toBe(1);
  });

  /**
   * TEST 6: Invalid payout option
   * Fake option ID -> rejected
   */
  test('TEST 6: Invalid payout option ID is rejected with 400 INVALID_PAYOUT_OPTION', async () => {
    const { token } = await createTestUser({
      walletBalances: { ves: 10000, sves: 0, gems: 0, tokens: 0, spins: 0 }
    });

    const res = await request(app)
      .post('/api/withdrawals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        method: 'UPI',
        optionId: 'fake_non_existent_option_id',
        payoutDetails: {
          upiId: 'valid@okhdfcbank'
        }
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('INVALID_PAYOUT_OPTION');
  });

  /**
   * TEST 8: Rejected withdrawal
   * Verify wallet reversal/release correctly follows Option A architecture
   */
  test('TEST 8: Rejected withdrawal creates safe reversal CREDIT ledger and refunds deducted balance', async () => {
    const admin = await createTestUser({
      email: 'admin@veloop.test',
      role: USER_ROLES.ADMIN
    });
    const regularUser = await createTestUser({
      email: 'regular@veloop.test',
      walletBalances: { ves: 10000, sves: 0, gems: 0, tokens: 0, spins: 0 }
    });

    // 1. User submits withdrawal: 10,000 - 2,400 = 7,600 VEs
    const withdrawRes = await request(app)
      .post('/api/withdrawals')
      .set('Authorization', `Bearer ${regularUser.token}`)
      .send({
        method: 'UPI',
        optionId: 'upi_10',
        payoutDetails: {
          upiId: 'john@okhdfcbank'
        }
      });

    expect(withdrawRes.status).toBe(201);
    const withdrawalId = withdrawRes.body.data.withdrawalId;

    // Verify balance is deducted to 7,600
    const walletMid = await Wallet.findOne({ userId: regularUser.user._id });
    expect(walletMid.ves).toBe(7600);

    // 2. Admin rejects withdrawal
    const rejectRes = await request(app)
      .patch(`/api/withdrawals/${withdrawalId}/reject`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        reason: 'Invalid UPI recipient account name mismatch'
      });

    expect(rejectRes.status).toBe(200);
    expect(rejectRes.body.success).toBe(true);
    expect(rejectRes.body.data.withdrawal.status).toBe(WITHDRAWAL_STATUS.REJECTED);
    expect(rejectRes.body.data.withdrawal.rejectionReason).toBe('Invalid UPI recipient account name mismatch');

    // 3. Verify user's wallet is fully refunded back to 10,000 VEs
    const walletRefunded = await Wallet.findOne({ userId: regularUser.user._id });
    expect(walletRefunded.ves).toBe(10000);

    // 4. Verify historical ledger integrity:
    // Original DEBIT ledger record must still exist (NEVER DELETED)
    const debitRecord = await WalletTransaction.findOne({
      userId: regularUser.user._id,
      type: TRANSACTION_TYPES.DEBIT,
      referenceId: withdrawalId
    });
    expect(debitRecord).not.toBeNull();
    expect(debitRecord.amount).toBe(2400);

    // New CREDIT refund ledger record must exist
    const refundRecord = await WalletTransaction.findOne({
      userId: regularUser.user._id,
      type: TRANSACTION_TYPES.CREDIT,
      source: TRANSACTION_SOURCES.WITHDRAWAL_REFUND,
      referenceId: withdrawalId
    });
    expect(refundRecord).not.toBeNull();
    expect(refundRecord.amount).toBe(2400);
    expect(refundRecord.balanceBefore).toBe(7600);
    expect(refundRecord.balanceAfter).toBe(10000);
  });

  /**
   * TEST 9: API manipulation
   * Frontend sends { amount: 100000 } or { requiredAmount: 1 }
   * Backend must still calculate/validate the actual configured withdrawal cost
   */
  test('TEST 9: Backend calculates authoritative amount from MongoDB and ignores any client-supplied amount tampering', async () => {
    const { user, token } = await createTestUser({
      walletBalances: { ves: 10000, sves: 0, gems: 0, tokens: 0, spins: 0 }
    });

    // Malicious request trying to override cost with 1 VE or payout with 100000
    const res = await request(app)
      .post('/api/withdrawals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        method: 'UPI',
        optionId: 'upi_10', // DB config says: requiredAmount = 2400, payoutValue = 10
        amount: 1, // Tampered client value
        requiredAmount: 1, // Tampered client value
        payoutAmount: 999999, // Tampered client value
        payoutDetails: {
          upiId: 'tamper@okhdfcbank'
        }
      });

    expect(res.status).toBe(201);
    // Backend must enforce DB values, NOT client values
    expect(res.body.data.currencyAmount).toBe(2400);
    expect(res.body.data.payoutAmount).toBe(10);

    // Wallet balance deducted by exactly 2400 (10000 - 2400 = 7600), not 1
    const wallet = await Wallet.findOne({ userId: user._id });
    expect(wallet.ves).toBe(7600);
  });

  test('Inactive payout option is rejected with 400 INACTIVE_PAYOUT_OPTION', async () => {
    const { token } = await createTestUser({
      walletBalances: { ves: 50000, sves: 0, gems: 0, tokens: 0, spins: 0 }
    });

    const res = await request(app)
      .post('/api/withdrawals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        method: 'UPI',
        optionId: 'upi_inactive_test', // marked active: false
        payoutDetails: {
          upiId: 'test@upi'
        }
      });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INACTIVE_PAYOUT_OPTION');
  });

  test('Invalid UPI ID format is rejected with 400 INVALID_PAYOUT_DETAILS', async () => {
    const { token } = await createTestUser({
      walletBalances: { ves: 10000, sves: 0, gems: 0, tokens: 0, spins: 0 }
    });

    const res = await request(app)
      .post('/api/withdrawals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        method: 'UPI',
        optionId: 'upi_10',
        payoutDetails: {
          upiId: 'not_a_valid_upi_address' // missing @bank
        }
      });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_PAYOUT_DETAILS');
  });

  test('Admin can approve pending withdrawal', async () => {
    const admin = await createTestUser({ role: USER_ROLES.ADMIN });
    const user = await createTestUser({ walletBalances: { ves: 5000 } });

    const createRes = await request(app)
      .post('/api/withdrawals')
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        method: 'UPI',
        optionId: 'upi_10',
        payoutDetails: { upiId: 'valid@okhdfcbank' }
      });

    const withdrawalId = createRes.body.data.withdrawalId;

    const approveRes = await request(app)
      .patch(`/api/withdrawals/${withdrawalId}/approve`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ reviewNote: 'Payment processed via banking partner' });

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.data.status).toBe(WITHDRAWAL_STATUS.APPROVED);
    expect(approveRes.body.data.reviewNote).toBe('Payment processed via banking partner');
  });
});
