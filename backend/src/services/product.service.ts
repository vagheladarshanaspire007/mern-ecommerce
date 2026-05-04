import { cacheGet, cacheSet, cacheInvalidatePattern } from '../config/redis';
import { AppError } from '../utils/AppError';
import {
  createProduct,
  findCategories,
  findProductById,
  findProducts,
  softDeleteProduct,
  updateProduct,
  type CreateProductInput,
  type ProductCursor,
  type ProductListFilters,
  type ProductListItem,
  type UpdateProductInput,
} from '../models/product.model';

type ListProductsParams = {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: string;
  inStock?: boolean;
  limit: number;
  cursor?: string;
};

type ProductListCacheValue = {
  data: ProductListItem[];
  nextCursor: string | null;
  hasMore: boolean;
};

const PRODUCT_LIST_TTL_SECONDS = 300;

const encodeCursor = (cursor: ProductCursor | null): string | null => {
  if (!cursor) return null;
  return Buffer.from(JSON.stringify(cursor), 'utf8').toString('base64url');
};

const decodeCursor = (cursor: string | undefined): ProductCursor | null => {
  if (!cursor) return null;

  try {
    const parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as ProductCursor;

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof parsed.createdAt !== 'string' ||
      typeof parsed.id !== 'string'
    ) {
      return null;
    }

    return parsed;
  } catch {
    throw new AppError(400, 'INVALID_CURSOR', 'Invalid cursor value');
  }
};

const buildListCacheKey = (params: ListProductsParams): string => {
  const payload = {
    search: params.search ?? null,
    minPrice: params.minPrice ?? null,
    maxPrice: params.maxPrice ?? null,
    categoryId: params.categoryId ?? null,
    inStock: params.inStock ?? null,
    limit: params.limit,
    cursor: params.cursor ?? null,
  };

  return `products:list:${Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')}`;
};

export async function listProducts(params: ListProductsParams) {
  const cursor = decodeCursor(params.cursor);
  const cacheKey = buildListCacheKey(params);

  const cached = await cacheGet<ProductListCacheValue>(cacheKey);
  if (cached) {
    return {
      data: cached.data,
      nextCursor: cached.nextCursor,
      hasMore: cached.hasMore,
      cached: true,
    };
  }

  const filters: ProductListFilters = {
    search: params.search,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    categoryId: params.categoryId,
    inStock: params.inStock,
  };

  const result = await findProducts(filters, cursor, params.limit);

  const serialized = {
    data: result.data,
    nextCursor: encodeCursor(result.nextCursor),
    hasMore: result.hasMore,
  };

  await cacheSet(cacheKey, serialized, PRODUCT_LIST_TTL_SECONDS);

  return {
    ...serialized,
    cached: false,
  };
}

export async function getProductById(id: string) {
  const product = await findProductById(id);

  if (!product) {
    throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
  }

  return product;
}

export async function getCategories() {
  return findCategories();
}

export async function createProductService(input: CreateProductInput) {
  const created = await createProduct(input);

  if (!created) {
    throw new AppError(500, 'PRODUCT_CREATE_FAILED', 'Failed to create product');
  }

  await cacheInvalidatePattern('products:*');

  return created;
}

export async function updateProductService(id: string, input: UpdateProductInput) {
  // console.log(id, input);
  const updated = await updateProduct(id, input);

  if (!updated) {
    throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
  }

  await cacheInvalidatePattern('products:*');

  return updated;
}

export async function deleteProductService(id: string) {
  const deleted = await softDeleteProduct(id);

  if (!deleted) {
    throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
  }

  await cacheInvalidatePattern('products:*');

  return { deleted: true };
}
