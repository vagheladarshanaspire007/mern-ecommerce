import request from 'supertest';
import { app } from '../../app';
import { query } from '../../config/database';

describe('Auth routes', () => {
  let testEmail: string;

  afterEach(async () => {
    if (testEmail) {
      await query('DELETE FROM users WHERE email = $1', [testEmail]);
      testEmail = '';
    }
  });
  it('POST /api/v1/auth/register', async () => {
    testEmail = `test-${Date.now()}@example.com`;
    const email = testEmail;

    const res = await request(app).post('/api/v1/auth/register').send({
      firstName: 'Test',
      lastName: 'User',
      email,
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('POST /api/v1/auth/login', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@example.com',
      password: 'Password123!',
      rememberMe: false,
    });

    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
  });
});
