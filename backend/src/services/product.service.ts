import {
  cacheGet,
  cacheInvalidatePattern,
  cacheSet,
} from '../config/redis';
import { ProductModel, type ProductInput, type ProductUpdateInput } from '../models/product.model';
import { AppError } from '../utils/AppError';
import type { CreateProductDto, ListProductsDto, UpdateProductDto } from '../validators/product.validator';

const CACHE_TTL = 300;

const encodeCursor = (createdAt: Date, id: string): string =>
  Buffer.from(JSON.stringify({ createdAt: createdAt.toISOString(), id })).toString('base64url');

const decodeCursor = (cursor: string): { createdAt: string; id: string } => {
  try {
    const decoded = JSON.parse(Buffer.from(cursor, 'base64url').toString()) as {
      createdAt: string;
      id: string;
    };

    if (!decoded.createdAt || !decoded.id) throw new Error();
    return decoded;
  } catch {
    throw new AppError(400, 'INVALID_CURSOR', 'Invalid pagination cursor');
  }
};

export const ProductService = {
  list: async (filters: ListProductsDto) => {
    const cacheKey = `products:list:${Buffer.from(JSON.stringify(filters)).toString('base64url')}`;

    const cached = await cacheGet<{
      products: unknown[];
      nextCursor: string | null;
    }>(cacheKey);

    if (cached) return cached;

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filters.search) {
      params.push(`%${filters.search}%`);
      conditions.push(`(p.name ILIKE $${params.length} OR p.description ILIKE $${params.length})`);
    }

    if (filters.minPrice !== undefined) {
      params.push(filters.minPrice);
      conditions.push(`p.price >= $${params.length}`);
    }

    if (filters.maxPrice !== undefined) {
      params.push(filters.maxPrice);
      conditions.push(`p.price <= $${params.length}`);
    }

    if (filters.categoryId) {
      params.push(filters.categoryId);
      conditions.push(`p.category_id = $${params.length}`);
    }

    if (filters.inStock !== undefined) {
      conditions.push(filters.inStock ? 'p.stock > 0' : 'p.stock = 0');
    }

    if (filters.cursor) {
      const cursor = decodeCursor(filters.cursor);
      params.push(cursor.createdAt);
      const createdAtParam = params.length;
      params.push(cursor.id);
      const idParam = params.length;

      conditions.push(
        `(p.created_at, p.id) < ($${createdAtParam}, $${idParam})`
      );
    }

    const result = await ProductModel.findMany(
      conditions.length ? `AND ${conditions.join(' AND ')}` : '',
      params,
      filters.limit + 1
    );

    const hasMore = result.length > filters.limit;
    const products = hasMore ? result.slice(0, filters.limit) : result;
    const last = products[products.length - 1];

    const response = {
      products,
      nextCursor: hasMore && last ? encodeCursor(last.createdAt, last.id) : null,
    };

    await cacheSet(cacheKey, response, CACHE_TTL);

    return response;
  },

  getById: async (id: string) => {
    const product = await ProductModel.findById(id);

    if (!product) {
      throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
    }

    return product;
  },

  categories: async () => ProductModel.findCategories(),

  create: async (data: CreateProductDto) => {
    const product = await ProductModel.create(data as ProductInput);
    await cacheInvalidatePattern('products:*');
    return product;
  },

  update: async (id: string, data: UpdateProductDto) => {
    const product = await ProductModel.update(id, data as ProductUpdateInput);

    if (!product) {
      throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
    }

    await cacheInvalidatePattern('products:*');
    return product;
  },

  delete: async (id: string) => {
    const deleted = await ProductModel.softDelete(id);

    if (!deleted) {
      throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
    }

    await cacheInvalidatePattern('products:*');
  },
};
