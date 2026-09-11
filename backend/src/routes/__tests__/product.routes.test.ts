import request from 'supertest';
import { app } from '../../app';
import { query } from '../../config/database';

describe('Product routes', () => {
  let adminToken: string;
  let testProductId: string | undefined;

  afterEach(async () => {
    if (testProductId) {
      await query('DELETE FROM products WHERE id = $1', [testProductId]);
      testProductId = undefined;
    }
  });

  beforeAll(async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@example.com',
      password: 'Password123!',
      rememberMe: false,
    });

    adminToken = res.body.data.accessToken;
  });

  it('GET /api/v1/products', async () => {
    const res = await request(app).get('/api/v1/products');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it('POST /api/v1/products with admin token', async () => {
    const categories = await request(app).get('/api/v1/products/categories');
    const categoryId = categories.body.data?.categories?.[0]?.id;

    expect(categoryId).toBeDefined();

    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Test Product ${Date.now()}`,
        description: 'Integration test product',
        price: 99.99,
        stock: 10,
        categoryId,
        imageUrls: [],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.product).toBeDefined();
    testProductId = res.body.data.product.id;
  });
});
