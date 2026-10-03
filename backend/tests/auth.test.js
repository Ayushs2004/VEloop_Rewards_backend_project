const request = require('supertest');
const app = require('../src/app');
const { setupTestDB } = require('./setup');

setupTestDB();

describe('Auth Validation & Registration Rules', () => {
  test('Valid password (8-15 chars, uppercase, lowercase, number, special char) registers successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'strong_pass_user@veloop.test',
        password: 'Password123!',
        name: 'Strong Pass User'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  test('Password shorter than 8 characters is rejected', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'short_pass@veloop.test',
        password: 'Pass1!',
        name: 'Short Pass User'
      });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
    expect(JSON.stringify(res.body.errors)).toMatch(/8 and 15 characters/i);
  });

  test('Password longer than 15 characters is rejected', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'long_pass@veloop.test',
        password: 'SuperLongPassword123!Extra',
        name: 'Long Pass User'
      });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
    expect(JSON.stringify(res.body.errors)).toMatch(/8 and 15 characters/i);
  });

  test('Password missing uppercase letter is rejected', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'no_upper@veloop.test',
        password: 'password123!',
        name: 'No Upper User'
      });

    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body.errors)).toMatch(/uppercase letter/i);
  });

  test('Password missing lowercase letter is rejected', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'no_lower@veloop.test',
        password: 'PASSWORD123!',
        name: 'No Lower User'
      });

    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body.errors)).toMatch(/lowercase letter/i);
  });

  test('Password missing number is rejected', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'no_num@veloop.test',
        password: 'Password!',
        name: 'No Num User'
      });

    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body.errors)).toMatch(/number/i);
  });

  test('Password missing special character is rejected', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'no_special@veloop.test',
        password: 'Password123',
        name: 'No Special User'
      });

    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body.errors)).toMatch(/special character/i);
  });
});
