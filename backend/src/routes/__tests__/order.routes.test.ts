import request from 'supertest';
import { app } from '../../app';
import { query } from '../../config/database';

describe('Order routes', () => {
  let token: string;
  let testOrderId: string | undefined;

  beforeAll(async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@example.com',
      password: 'Password123!',
      rememberMe: false,
    });

    token = res.body.data.accessToken;
  });

  afterEach(async () => {
    if (testOrderId) {
      await query('DELETE FROM orders WHERE id = $1', [testOrderId]);
      testOrderId = undefined;
    }
  });

  it('POST /api/v1/orders succeeds with valid stock', async () => {
    const products = await request(app).get('/api/v1/products');
    const product = products.body.data.products?.[0];

    expect(product).toBeDefined();

    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [{ productId: product.id, quantity: 1 }],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    testOrderId = res.body.data.order.id;
  });

  it('POST /api/v1/orders fails with insufficient stock', async () => {
    const products = await request(app).get('/api/v1/products');
    const product = products.body.data.products?.[0];

    expect(product).toBeDefined();

    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [{ productId: product.id, quantity: 999999 }],
      });

    expect(res.status).toBe(409);
  });
});
