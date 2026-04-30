import type {
  ApiResponse,
  Category,
  PaginatedResponse,
  Product,
  ProductMutationPayload,
  UploadImageResponse,
} from '@/types/auth.types';
import api from './api';

/* -------------------- TYPES -------------------- */

export interface ProductQueryParams {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  inStock?: boolean;
  cursor?: string;
  limit?: number;
}

export type ProductListItem = Product;
export type ProductCategory = Category;

export interface ProductListResult {
  items: ProductListItem[];
  nextCursor: string | null;
}

type ProductLike = Partial<Product> & Pick<Product, 'id' | 'name'>;

/* -------------------- HELPERS -------------------- */

function unwrapData<T>(response: T | ApiResponse<T>): T {
  if (typeof response === 'object' && response !== null && 'data' in response) {
    return response.data;
  }
  return response;
}

function toSafeNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function normalizeProduct(product: ProductLike): Product {
  const images =
    product.images?.map((image, index) => ({
      id: image.id ?? `${product.id}-image-${index}`,
      url: image.url,
      alt: image.alt ?? `${product.name} image ${index + 1}`,
    })) ??
    product.imageUrls?.map((url, index) => ({
      id: `${product.id}-image-${index}`,
      url,
      alt: `${product.name} image ${index + 1}`,
    })) ??
    [];

  return {
    id: product.id,
    name: product.name,
    description: product.description ?? '',
    price: toSafeNumber(product.price),
    stock: toSafeNumber(product.stock),
    category: product.category ?? null,
    imageUrls: images.map((img) => img.url),
    images,
    averageRating: toSafeNumber(product.averageRating),
    reviewCount: toSafeNumber(product.reviewCount, product.reviews?.length ?? 0),
    reviews: product.reviews ?? [],
    isActive: product.isActive ?? true,
    createdAt: product.createdAt ?? new Date().toISOString(),
    updatedAt: product.updatedAt ?? new Date().toISOString(),
  };
}

function normalizeProducts(response: ProductLike[] | PaginatedResponse<ProductLike>): Product[] {
  const items = Array.isArray(response) ? response : response.items;
  return items.map(normalizeProduct);
}

function normalizeCategories(response: Category[] | { categories: Category[] }): Category[] {
  return Array.isArray(response) ? response : response.categories;
}

function normalizeProductListResult(
  response:
    | ProductLike[]
    | PaginatedResponse<ProductLike>
    | {
        data?: ProductLike[];
        items?: ProductLike[];
        pagination?: { nextCursor?: string | null; hasMore?: boolean };
        nextCursor?: string | null;
      }
): ProductListResult {
  if (Array.isArray(response)) {
    return { items: response.map(normalizeProduct), nextCursor: null };
  }

  if ('items' in response && Array.isArray(response.items)) {
    return {
      items: response.items.map(normalizeProduct),
      nextCursor: null,
    };
  }

  if ('data' in response && Array.isArray(response.data)) {
    return {
      items: response.data.map(normalizeProduct),
      nextCursor: response.pagination?.nextCursor ?? response.nextCursor ?? null,
    };
  }

  return { items: [], nextCursor: null };
}

function normalizeUploadResponse(
  response: UploadImageResponse | { imageUrl?: string; file?: { path?: string } }
): UploadImageResponse {
  const url =
    ('url' in response ? response.url : undefined) ??
    ('imageUrl' in response ? response.imageUrl : undefined) ??
    ('file' in response ? response.file?.path : undefined);

  if (!url) {
    throw new Error('Upload completed but no image URL returned.');
  }

  return { url };
}

/* -------------------- SERVICE -------------------- */

export const productService = {
  async getProductById(id: string): Promise<Product> {
    const { data } = await api.get<ApiResponse<ProductLike> | ProductLike>(`/products/${id}`);
    return normalizeProduct(unwrapData(data));
  },

  async listProducts(params?: ProductQueryParams): Promise<Product[]> {
    const { data } = await api.get<ApiResponse<ProductLike[] | PaginatedResponse<ProductLike>>>(
      '/products',
      {
        params: {
          search: params?.search,
          minPrice: params?.minPrice,
          maxPrice: params?.maxPrice,
          categoryId: params?.category,
          inStock: typeof params?.inStock === 'boolean' ? String(params.inStock) : undefined,
          cursor: params?.cursor,
          limit: params?.limit ?? 20,
        },
      }
    );

    return normalizeProducts(unwrapData(data));
  },

  async getProductCategories(): Promise<Category[]> {
    const { data } =
      await api.get<ApiResponse<Category[] | { categories: Category[] }>>('/products/categories');

    return normalizeCategories(unwrapData(data));
  },

  async createProduct(payload: ProductMutationPayload): Promise<Product> {
    const { data } = await api.post<ApiResponse<ProductLike> | ProductLike>('/products', payload);
    return normalizeProduct(unwrapData(data));
  },

  async updateProduct(id: string, payload: ProductMutationPayload): Promise<Product> {
    const { data } = await api.patch<ApiResponse<ProductLike> | ProductLike>(
      `/products/${id}`,
      payload
    );
    return normalizeProduct(unwrapData(data));
  },

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  },

  async uploadImage(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadImageResponse> {
    const formData = new FormData();
    formData.append('image', file);

    const { data } = await api.post<
      | ApiResponse<UploadImageResponse | { imageUrl?: string; file?: { path?: string } }>
      | UploadImageResponse
      | { imageUrl?: string; file?: { path?: string } }
    >('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (!event.total) return;
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      },
    });

    return normalizeUploadResponse(unwrapData(data));
  },
};

export async function fetchProducts(params?: ProductQueryParams): Promise<ProductListResult> {
  const { data } = await api.get<
    | ApiResponse<ProductLike[] | PaginatedResponse<ProductLike>>
    | {
        success: boolean;
        data: ProductLike[];
        pagination?: { nextCursor?: string | null; hasMore?: boolean };
      }
  >('/products', {
    params: {
      search: params?.search,
      minPrice: params?.minPrice,
      maxPrice: params?.maxPrice,
      categoryId: params?.category,
      inStock: typeof params?.inStock === 'boolean' ? String(params.inStock) : undefined,
      cursor: params?.cursor,
      limit: params?.limit ?? 20,
    },
  });

  const response = data as {
    data?: ProductLike[] | PaginatedResponse<ProductLike>;
    pagination?: { nextCursor?: string | null; hasMore?: boolean };
    nextCursor?: string | null;
  };

  const payload = response?.data;
  if (Array.isArray(payload)) {
    return normalizeProductListResult({
      data: payload,
      pagination: response.pagination,
      nextCursor: response.nextCursor,
    });
  }

  if (
    payload &&
    typeof payload === 'object' &&
    'items' in payload &&
    Array.isArray(payload.items)
  ) {
    return normalizeProductListResult({
      items: payload.items,
      pagination: response.pagination,
      nextCursor: response.nextCursor,
    });
  }

  return { items: [], nextCursor: null };
}

export async function fetchCategories(): Promise<ProductCategory[]> {
  return productService.getProductCategories();
}
