import {
  listProductsController,
  createProductController,
} from '../../controllers/product.controller';

type MockRes = {
  status: jest.MockedFunction<(code: number) => MockRes>;
  json: jest.MockedFunction<(body: unknown) => MockRes>;
};

const createMockRes = (): MockRes => {
  const res = {} as MockRes;
  res.status = jest.fn<MockRes, [number]>(() => res);
  res.json = jest.fn<MockRes, [unknown]>(() => res);
  return res;
};

jest.mock('../../services/product.service', () => ({
  listProducts: jest.fn(),
  getProductById: jest.fn(),
  getCategories: jest.fn(),
  createProductService: jest.fn(),
  updateProductService: jest.fn(),
  deleteProductService: jest.fn(),
}));

describe('product.routes', () => {
  it('GET /products', async () => {
    const res = createMockRes();
    const req = { query: { limit: 20 } } as Parameters<typeof listProductsController>[0];
    const service = await import('../../services/product.service');
    const listProductsMock = service.listProducts as jest.MockedFunction<
      typeof service.listProducts
    >;
    listProductsMock.mockResolvedValue({
      data: [],
      nextCursor: null,
      hasMore: false,
      cached: false,
    });

    await listProductsController(
      req,
      res as unknown as Parameters<typeof listProductsController>[1]
    );

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('POST /products (admin token)', async () => {
    const res = createMockRes();
    const req = {
      body: {
        name: 'Widget',
        price: 10,
        stock: 1,
        categoryId: '11111111-1111-1111-1111-111111111111',
      },
    } as Parameters<typeof createProductController>[0];
    const service = await import('../../services/product.service');
    const createProductMock = service.createProductService as jest.MockedFunction<
      typeof service.createProductService
    >;
    createProductMock.mockResolvedValue({
      id: 'p1',
      name: 'Widget',
      description: null,
      imageUrls: [],
      price: '10',
      stock: 1,
      categoryId: '11111111-1111-1111-1111-111111111111',
      category: {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Category',
        slug: 'category',
      },
      isActive: true,
      createdAt: 'now',
      updatedAt: 'now',
    } as Awaited<ReturnType<typeof service.createProductService>>);

    await createProductController(
      req,
      res as unknown as Parameters<typeof createProductController>[1]
    );

    expect(res.status).toHaveBeenCalledWith(201);
  });
});
