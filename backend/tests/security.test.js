const request = require('supertest');
const app = require('../src/app');
const { setupTestDB, createTestUser, seedTestPayoutOptions } = require('./setup');
const { USER_ROLES } = require('../src/config/constants');

setupTestDB();

describe('Security, Authorization & Tenant Isolation', () => {
  beforeEach(async () => {
    await seedTestPayoutOptions();
  });

  /**
   * TEST 7: Another user's wallet
   * User A attempts to access User B wallet / withdrawal
   */
  test('TEST 7: User A cannot access User B withdrawal details (403 Forbidden)', async () => {
    const userA = await createTestUser({ email: 'user_a@veloop.test', walletBalances: { ves: 5000 } });
    const userB = await createTestUser({ email: 'user_b@veloop.test', walletBalances: { ves: 5000 } });

    // User B creates a withdrawal
    const withdrawRes = await request(app)
      .post('/api/withdrawals')
      .set('Authorization', `Bearer ${userB.token}`)
      .send({
        method: 'UPI',
        optionId: 'upi_10',
        payoutDetails: { upiId: 'user_b@okhdfcbank' }
      });

    const userBWithdrawalId = withdrawRes.body.data.withdrawalId;

    // User A attempts to access User B's withdrawal by ID
    const attackerRes = await request(app)
      .get(`/api/withdrawals/${userBWithdrawalId}`)
      .set('Authorization', `Bearer ${userA.token}`);

    expect(attackerRes.status).toBe(403);
    expect(attackerRes.body.success).toBe(false);
    expect(attackerRes.body.code).toBe('FORBIDDEN');
    expect(attackerRes.body.message).toMatch(/Access denied/i);
  });

  test('GET /api/wallet: Ignores malicious query params (?userId=UserB) and binds strictly to JWT identity', async () => {
    const userA = await createTestUser({ email: 'user_a@veloop.test', walletBalances: { ves: 100 } });
    const userB = await createTestUser({ email: 'user_b@veloop.test', walletBalances: { ves: 999999 } });

    // User A attempts to fetch User B's wallet via query param
    const res = await request(app)
      .get(`/api/wallet?userId=${userB.user._id}`)
      .set('Authorization', `Bearer ${userA.token}`);

    expect(res.status).toBe(200);
    // Must return User A's balance (100), NOT User B's balance (999999)
    expect(res.body.data.ves).toBe(100);
    expect(res.body.data.userId.toString()).toBe(userA.user._id.toString());
  });

  test('Regular user calling admin credit endpoint is rejected with 403 FORBIDDEN', async () => {
    const regularUser = await createTestUser({ role: USER_ROLES.USER });

    const res = await request(app)
      .post('/api/wallet/credit')
      .set('Authorization', `Bearer ${regularUser.token}`)
      .send({
        userId: regularUser.user._id,
        amount: 10000
      });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  test('Unauthenticated request to protected endpoint returns 401 UNAUTHORIZED', async () => {
    const res = await request(app).get('/api/wallet');
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('UNAUTHORIZED');
  });

  test('Malformed or invalid JWT token is rejected with 401 INVALID_TOKEN', async () => {
    const res = await request(app)
      .get('/api/wallet')
      .set('Authorization', 'Bearer invalid.tampered.token');

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_TOKEN');
  });
});
