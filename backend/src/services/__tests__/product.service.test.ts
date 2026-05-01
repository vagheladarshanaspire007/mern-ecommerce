import type * as RedisConfig from '../../config/redis';
import type * as ProductModel from '../../models/product.model';

const mockCacheGet = jest.fn() as jest.MockedFunction<typeof RedisConfig.cacheGet>;
const mockCacheSet = jest.fn() as jest.MockedFunction<typeof RedisConfig.cacheSet>;
const mockCacheInvalidatePattern = jest.fn() as jest.MockedFunction<
  typeof RedisConfig.cacheInvalidatePattern
>;
const mockFindProducts = jest.fn() as jest.MockedFunction<typeof ProductModel.findProducts>;
const mockFindProductById = jest.fn() as jest.MockedFunction<typeof ProductModel.findProductById>;
const mockFindCategories = jest.fn() as jest.MockedFunction<typeof ProductModel.findCategories>;
const mockCreateProduct = jest.fn() as jest.MockedFunction<typeof ProductModel.createProduct>;
const mockUpdateProduct = jest.fn() as jest.MockedFunction<typeof ProductModel.updateProduct>;
const mockSoftDeleteProduct = jest.fn() as jest.MockedFunction<
  typeof ProductModel.softDeleteProduct
>;

jest.mock('../../config/redis', () => ({
  cacheGet: mockCacheGet,
  cacheSet: mockCacheSet,
  cacheInvalidatePattern: mockCacheInvalidatePattern,
}));

jest.mock('../../models/product.model', () => ({
  findProducts: mockFindProducts,
  findProductById: mockFindProductById,
  findCategories: mockFindCategories,
  createProduct: mockCreateProduct,
  updateProduct: mockUpdateProduct,
  softDeleteProduct: mockSoftDeleteProduct,
}));

import * as productService from '../product.service';

describe('product.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('list returns cached on 2nd call', async () => {
    mockCacheGet.mockResolvedValueOnce(null as never).mockResolvedValueOnce({
      data: [{ id: 'p1' }],
      nextCursor: null,
      hasMore: false,
    } as never);
    mockFindProducts.mockResolvedValue({
      data: [{ id: 'p1' }],
      nextCursor: null,
      hasMore: false,
    } as never);

    const first = await productService.listProducts({ limit: 10 });
    const second = await productService.listProducts({ limit: 10 });

    expect(first.cached).toBe(false);
    expect(second.cached).toBe(true);
    expect(mockFindProducts).toHaveBeenCalledTimes(1);
  });

  it('list throws on invalid cursor', async () => {
    await expect(
      productService.listProducts({ limit: 10, cursor: 'not-base64' })
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('list ignores structurally invalid cursor payload', async () => {
    const invalidCursor = Buffer.from(
      JSON.stringify({ createdAt: 123, id: null }),
      'utf8'
    ).toString('base64url');

    mockFindProducts.mockResolvedValue({
      data: [],
      nextCursor: null,
      hasMore: false,
    } as never);

    await expect(
      productService.listProducts({ limit: 10, cursor: invalidCursor })
    ).resolves.toMatchObject({
      cached: false,
    });
  });

  it('list encodes nextCursor when more data exists', async () => {
    mockFindProducts.mockResolvedValue({
      data: [{ id: 'p1', createdAt: '2024-01-01T00:00:00.000Z' }],
      nextCursor: { createdAt: '2024-01-01T00:00:00.000Z', id: 'p1' },
      hasMore: true,
    } as never);

    const result = await productService.listProducts({ limit: 10 });

    expect(result.cached).toBe(false);
    expect(result.nextCursor).toEqual(expect.any(String));
    expect(mockCacheSet).toHaveBeenCalled();
  });

  it('list decodes a valid cursor payload', async () => {
    const cursor = Buffer.from(
      JSON.stringify({ createdAt: '2024-01-01T00:00:00.000Z', id: 'p1' }),
      'utf8'
    ).toString('base64url');

    mockFindProducts.mockResolvedValue({
      data: [],
      nextCursor: null,
      hasMore: false,
    } as never);

    await productService.listProducts({ limit: 10, cursor });

    expect(mockFindProducts).toHaveBeenCalledWith(
      expect.any(Object),
      { createdAt: '2024-01-01T00:00:00.000Z', id: 'p1' },
      10
    );
  });

  it('cache invalidated on update', async () => {
    mockUpdateProduct.mockResolvedValue({ id: 'p1' } as never);

    const result = await productService.updateProductService('p1', { name: 'Updated' });

    expect(result).toEqual({ id: 'p1' });
    expect(mockCacheInvalidatePattern).toHaveBeenCalledWith('products:*');
  });

  it('soft delete sets is_active=false', async () => {
    mockSoftDeleteProduct.mockResolvedValue({ id: 'p1', isActive: false } as never);

    const result = await productService.deleteProductService('p1');

    expect(result).toEqual({ deleted: true });
    expect(mockSoftDeleteProduct).toHaveBeenCalledWith('p1');
    expect(mockCacheInvalidatePattern).toHaveBeenCalledWith('products:*');
  });

  it('getProductById success', async () => {
    mockFindProductById.mockResolvedValue({ id: 'p1', name: 'Widget' } as never);

    await expect(productService.getProductById('p1')).resolves.toEqual({
      id: 'p1',
      name: 'Widget',
    });
  });

  it('getProductById missing product 404', async () => {
    mockFindProductById.mockResolvedValue(null as never);

    await expect(productService.getProductById('p1')).rejects.toMatchObject({ statusCode: 404 });
  });

  it('getCategories returns categories', async () => {
    mockFindCategories.mockResolvedValue([{ id: 'c1', name: 'Cat', slug: 'cat' }] as never);

    await expect(productService.getCategories()).resolves.toEqual([
      { id: 'c1', name: 'Cat', slug: 'cat' },
    ]);
  });

  it('createProductService success and failure', async () => {
    mockCreateProduct.mockResolvedValueOnce({ id: 'p1' } as never);
    await expect(
      productService.createProductService({
        name: 'Widget',
        price: 10,
        stock: 1,
        categoryId: '11111111-1111-1111-1111-111111111111',
      })
    ).resolves.toEqual({ id: 'p1' });
    expect(mockCacheInvalidatePattern).toHaveBeenCalledWith('products:*');

    mockCreateProduct.mockResolvedValueOnce(null as never);
    await expect(
      productService.createProductService({
        name: 'Widget',
        price: 10,
        stock: 1,
        categoryId: '11111111-1111-1111-1111-111111111111',
      })
    ).rejects.toMatchObject({ statusCode: 500 });
  });

  it('updateProductService missing product 404', async () => {
    mockUpdateProduct.mockResolvedValue(null as never);

    await expect(
      productService.updateProductService('p1', { name: 'Updated' })
    ).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('deleteProductService missing product 404', async () => {
    mockSoftDeleteProduct.mockResolvedValue(null as never);

    await expect(productService.deleteProductService('p1')).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
