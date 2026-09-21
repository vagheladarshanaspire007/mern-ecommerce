import { ProductService } from '../product.service';
import { ProductModel } from '../../models/product.model';
import { cacheGet, cacheInvalidatePattern } from '../../config/redis';

jest.mock('../../models/product.model', () => ({
  ProductModel: {
    findMany: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    findCategories: jest.fn(),
  },
}));

jest.mock('../../config/redis', () => ({
  cacheGet: jest.fn(),
  cacheSet: jest.fn(),
  cacheInvalidatePattern: jest.fn(),
}));

const product = {
  id: 'product-1',
  name: 'Laptop',
  description: 'Test laptop',
  price: '1000.00',
  stock: 10,
  imageUrls: [],
  isActive: true,
  categoryId: 'category-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('ProductService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns cached products on the second call', async () => {
    const filters = { limit: 10 };
    const response = { products: [product], nextCursor: null };

    (cacheGet as jest.Mock).mockResolvedValueOnce(null).mockResolvedValueOnce(response);
    (ProductModel.findMany as jest.Mock).mockResolvedValue([product]);

    await ProductService.list(filters);
    const result = await ProductService.list(filters);

    expect(result).toEqual(response);
    expect(ProductModel.findMany).toHaveBeenCalledTimes(1);
    expect(cacheGet).toHaveBeenCalledTimes(2);
  });

  it('invalidates product cache after update', async () => {
    (ProductModel.update as jest.Mock).mockResolvedValue(product);
    (cacheInvalidatePattern as jest.Mock).mockResolvedValue(undefined);

    const result = await ProductService.update('product-1', {
      name: 'Updated Laptop',
    });

    expect(result).toEqual(product);
    expect(ProductModel.update).toHaveBeenCalledWith('product-1', { name: 'Updated Laptop' });
    expect(cacheInvalidatePattern).toHaveBeenCalledWith('products:*');
  });

  it('soft deletes a product', async () => {
    (ProductModel.softDelete as jest.Mock).mockResolvedValue(true);
    (cacheInvalidatePattern as jest.Mock).mockResolvedValue(undefined);

    await ProductService.delete('product-1');

    expect(ProductModel.softDelete).toHaveBeenCalledWith('product-1');
    expect(cacheInvalidatePattern).toHaveBeenCalledWith('products:*');
  });
});

describe('ProductService additional coverage', () => {
  it('builds list filters and cursor pagination', async () => {
    (cacheGet as jest.Mock).mockResolvedValue(null);
    (ProductModel.findMany as jest.Mock).mockResolvedValue([
      product,
      { ...product, id: 'product-2', createdAt: new Date(Date.now() - 1000) },
      { ...product, id: 'product-3', createdAt: new Date(Date.now() - 2000) },
    ]);

    const result = await ProductService.list({
      limit: 2,
      search: 'Laptop',
      minPrice: 500,
      maxPrice: 1500,
      categoryId: 'category-1',
      inStock: true,
      cursor: Buffer.from(
        JSON.stringify({
          createdAt: new Date().toISOString(),
          id: 'cursor-id',
        })
      ).toString('base64url'),
    });

    expect(ProductModel.findMany).toHaveBeenCalledWith(
      expect.stringContaining('p.name ILIKE'),
      expect.arrayContaining(['%Laptop%', 500, 1500, 'category-1']),
      3
    );
    expect(result.products).toHaveLength(2);
    expect(result.nextCursor).toEqual(expect.any(String));
  });

  it('rejects an invalid cursor', async () => {
    (cacheGet as jest.Mock).mockResolvedValue(null);

    await expect(
      ProductService.list({
        limit: 10,
        cursor: 'invalid-cursor',
      })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('gets a product by id', async () => {
    (ProductModel.findById as jest.Mock).mockResolvedValue(product);
    await expect(ProductService.getById('product-1')).resolves.toEqual(product);
  });

  it('throws 404 when product is missing', async () => {
    (ProductModel.findById as jest.Mock).mockResolvedValue(null);
    await expect(ProductService.getById('missing')).rejects.toMatchObject({ statusCode: 404 });
  });

  it('creates a product and invalidates cache', async () => {
    (ProductModel.create as jest.Mock).mockResolvedValue(product);

    const result = await ProductService.create({
      name: 'Laptop',
      description: 'Test laptop',
      price: 1000,
      stock: 10,
      categoryId: 'category-1',
      imageUrls: [],
    });

    expect(result).toEqual(product);
    expect(cacheInvalidatePattern).toHaveBeenCalledWith('products:*');
  });

  it('throws 404 when updating a missing product', async () => {
    (ProductModel.update as jest.Mock).mockResolvedValue(null);
    await expect(ProductService.update('missing', { name: 'x' })).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('throws 404 when deleting a missing product', async () => {
    (ProductModel.softDelete as jest.Mock).mockResolvedValue(false);
    await expect(ProductService.delete('missing')).rejects.toMatchObject({ statusCode: 404 });
  });

  it('returns categories', async () => {
    (ProductModel.findCategories as jest.Mock).mockResolvedValue([]);
    await expect(ProductService.categories()).resolves.toEqual([]);
  });
});
