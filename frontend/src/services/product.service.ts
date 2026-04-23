import type {
  ApiResponse,
  Category,
  Product,
  ProductMutationPayload,
  UploadImageResponse,
} from '@/types/auth.types';
import api from './api';

const PRODUCTS_STORAGE_KEY = 'mern-ecommerce:products';
const CATEGORIES_STORAGE_KEY = 'mern-ecommerce:categories';

const sampleCategories: Category[] = [
  { id: 'cat-electronics', name: 'Electronics', slug: 'electronics' },
  { id: 'cat-home', name: 'Home', slug: 'home' },
  { id: 'cat-wellness', name: 'Wellness', slug: 'wellness' },
];

const sampleProducts: Product[] = [
  {
    id: 'prod-headphones',
    name: 'Auralite Studio Headphones',
    description:
      'Closed-back headphones tuned for long listening sessions, with memory foam ear cups and a balanced sound profile.',
    price: 149.99,
    stock: 18,
    category: sampleCategories[0],
    imageUrls: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=80',
    ],
    images: [
      {
        id: 'img-headphones-1',
        url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
        alt: 'Studio headphones angled on a neutral background',
      },
      {
        id: 'img-headphones-2',
        url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80',
        alt: 'Side profile of premium over-ear headphones',
      },
      {
        id: 'img-headphones-3',
        url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=80',
        alt: 'Headphones resting beside a music player',
      },
    ],
    averageRating: 4.6,
    reviewCount: 7,
    reviews: [
      {
        id: 'review-1',
        rating: 5,
        comment: 'Fantastic clarity and very comfortable during long editing sessions.',
        createdAt: '2026-04-03T10:00:00.000Z',
        reviewer: { firstName: 'Alicia', lastName: 'Ray' },
      },
      {
        id: 'review-2',
        rating: 4,
        comment: 'Great value. Bass is controlled and not overpowering.',
        createdAt: '2026-04-05T10:00:00.000Z',
        reviewer: { firstName: 'Jordan', lastName: 'Lee' },
      },
      {
        id: 'review-3',
        rating: 5,
        comment: 'Build quality feels premium and the ear pads stay cool.',
        createdAt: '2026-04-06T10:00:00.000Z',
        reviewer: { firstName: 'Mina', lastName: 'Shah' },
      },
      {
        id: 'review-4',
        rating: 4,
        comment: 'A little snug at first, but the sound is excellent.',
        createdAt: '2026-04-09T10:00:00.000Z',
        reviewer: { firstName: 'Chris', lastName: 'Bell' },
      },
      {
        id: 'review-5',
        rating: 5,
        comment: 'Exactly what I wanted for mixing and casual listening.',
        createdAt: '2026-04-12T10:00:00.000Z',
        reviewer: { firstName: 'Priya', lastName: 'Singh' },
      },
      {
        id: 'review-6',
        rating: 4,
        comment: 'Solid isolation and detailed highs.',
        createdAt: '2026-04-14T10:00:00.000Z',
        reviewer: { firstName: 'Marco', lastName: 'Silva' },
      },
      {
        id: 'review-7',
        rating: 5,
        comment: 'The fold-flat design is a nice bonus for travel.',
        createdAt: '2026-04-18T10:00:00.000Z',
        reviewer: { firstName: 'Dana', lastName: 'Lopez' },
      },
    ],
    isActive: true,
    createdAt: '2026-04-01T10:00:00.000Z',
    updatedAt: '2026-04-18T10:00:00.000Z',
  },
  {
    id: 'prod-lamp',
    name: 'Halo Desk Lamp',
    description: 'Minimal task lamp with dimmable warm light and a compact aluminum body.',
    price: 79,
    stock: 5,
    category: sampleCategories[1],
    imageUrls: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    ],
    images: [
      {
        id: 'img-lamp-1',
        url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
        alt: 'Compact desk lamp on a wood table',
      },
    ],
    averageRating: 4.2,
    reviewCount: 2,
    reviews: [
      {
        id: 'review-8',
        rating: 4,
        comment: 'Looks clean on my desk and the dimmer is smooth.',
        createdAt: '2026-04-11T10:00:00.000Z',
        reviewer: { firstName: 'Nina', lastName: 'Patel' },
      },
      {
        id: 'review-9',
        rating: 4,
        comment: 'Wish the cable were longer, but otherwise very nice.',
        createdAt: '2026-04-17T10:00:00.000Z',
        reviewer: { firstName: 'Evan', lastName: 'Cole' },
      },
    ],
    isActive: true,
    createdAt: '2026-04-02T10:00:00.000Z',
    updatedAt: '2026-04-17T10:00:00.000Z',
  },
];

function buildStorageProduct(product: Product): Product {
  return {
    ...product,
    imageUrls: product.images.map((image) => image.url),
  };
}

function getLocalCategories(): Category[] {
  if (globalThis.window === undefined) {
    return sampleCategories;
  }

  const stored = globalThis.window.localStorage.getItem(CATEGORIES_STORAGE_KEY);
  if (!stored) {
    globalThis.window.localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(sampleCategories));
    return sampleCategories;
  }

  try {
    return JSON.parse(stored) as Category[];
  } catch {
    return sampleCategories;
  }
}

function getLocalProducts(): Product[] {
  if (globalThis.window === undefined) {
    return sampleProducts;
  }

  const stored = globalThis.window.localStorage.getItem(PRODUCTS_STORAGE_KEY);
  if (!stored) {
    const normalized = sampleProducts.map(buildStorageProduct);
    globalThis.window.localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  }

  try {
    return JSON.parse(stored) as Product[];
  } catch {
    return sampleProducts;
  }
}

function setLocalProducts(products: Product[]) {
  if (globalThis.window === undefined) {
    return;
  }

  globalThis.window.localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
}

function normalizeProduct(product: Partial<Product> & { id: string; name: string }): Product {
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
    price: product.price ?? 0,
    stock: product.stock ?? 0,
    category: product.category ?? null,
    imageUrls: images.map((image) => image.url),
    images,
    averageRating: product.averageRating ?? 0,
    reviewCount: product.reviewCount ?? product.reviews?.length ?? 0,
    reviews: product.reviews ?? [],
    isActive: product.isActive ?? true,
    createdAt: product.createdAt ?? new Date().toISOString(),
    updatedAt: product.updatedAt ?? new Date().toISOString(),
  };
}

function unwrapData<T>(response: unknown): T {
  if (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    (response as { data?: T }).data !== undefined
  ) {
    return (response as { data: T }).data;
  }

  return response as T;
}

function parseProductResponse(response: unknown): Product {
  return normalizeProduct(unwrapData<Partial<Product> & { id: string; name: string }>(response));
}

function parseProductsResponse(response: unknown): Product[] {
  const source = unwrapData<{
    items?: Array<Partial<Product> & { id: string; name: string }>;
    products?: Array<Partial<Product> & { id: string; name: string }>;
  }>(response);
  const items = source.items ?? source.products ?? [];
  return items.map(normalizeProduct);
}

function parseCategoriesResponse(response: unknown): Category[] {
  const source = unwrapData<Category[] | { items?: Category[]; categories?: Category[] }>(response);

  if (Array.isArray(source)) {
    return source;
  }

  return source.categories ?? source.items ?? [];
}

function parseUploadResponse(response: unknown): UploadImageResponse {
  const source = unwrapData<{
    url?: string;
    imageUrl?: string;
    file?: { path?: string; filename?: string };
  }>(response);
  const url = source.url ?? source.imageUrl ?? source.file?.path;

  if (!url) {
    throw new Error('Upload completed but the server did not return an image URL.');
  }

  return { url };
}

function toMutationResult(payload: ProductMutationPayload, existing?: Product): Product {
  const categories = getLocalCategories();
  const category = categories.find((item) => item.id === payload.categoryId) ?? null;
  const images = payload.imageUrl
    ? [
        {
          id: `${existing?.id ?? crypto.randomUUID()}-image-0`,
          url: payload.imageUrl,
          alt: payload.name,
        },
      ]
    : (existing?.images ?? []);

  return normalizeProduct({
    ...existing,
    id: existing?.id ?? crypto.randomUUID(),
    name: payload.name,
    description: payload.description,
    price: payload.price,
    stock: payload.stock,
    category,
    images,
    imageUrls: images.map((image) => image.url),
    updatedAt: new Date().toISOString(),
  });
}

function isNotImplementedError(error: unknown) {
  return typeof error === 'object' && error !== null && 'status' in error && error.status === 501;
}

export const productService = {
  async getProductById(id: string): Promise<Product> {
    try {
      const { data } = await api.get<ApiResponse<Product> | Product>(`/products/${id}`);
      return parseProductResponse(data);
    } catch (error) {
      if (!isNotImplementedError(error)) {
        const localProduct = getLocalProducts().find((product) => product.id === id);
        if (localProduct) {
          return normalizeProduct(localProduct);
        }
      }

      const localProduct = getLocalProducts().find((product) => product.id === id);
      if (localProduct) {
        return normalizeProduct(localProduct);
      }

      throw error;
    }
  },

  async listProducts(): Promise<Product[]> {
    try {
      const { data } = await api.get<ApiResponse<{ items: Product[] }> | { items: Product[] }>(
        '/products'
      );
      return parseProductsResponse(data);
    } catch {
      return getLocalProducts().map(normalizeProduct);
    }
  },

  async getProductCategories(): Promise<Category[]> {
    try {
      const { data } = await api.get<ApiResponse<Category[]> | Category[]>('/products/categories');
      return parseCategoriesResponse(data);
    } catch {
      return getLocalCategories();
    }
  },

  async createProduct(payload: ProductMutationPayload): Promise<Product> {
    try {
      const { data } = await api.post<ApiResponse<Product> | Product>('/products', payload);
      return parseProductResponse(data);
    } catch (error) {
      if (!isNotImplementedError(error)) {
        throw error;
      }

      const next = toMutationResult(payload);
      const products = [...getLocalProducts(), next];
      setLocalProducts(products);
      return next;
    }
  },

  async updateProduct(id: string, payload: ProductMutationPayload): Promise<Product> {
    try {
      const { data } = await api.patch<ApiResponse<Product> | Product>(`/products/${id}`, payload);
      return parseProductResponse(data);
    } catch (error) {
      if (!isNotImplementedError(error)) {
        throw error;
      }

      const products = getLocalProducts();
      const existing = products.find((product) => product.id === id);
      if (!existing) {
        throw new Error('Product not found.');
      }

      const updated = toMutationResult(payload, existing);
      setLocalProducts(products.map((product) => (product.id === id ? updated : product)));
      return updated;
    }
  },

  async deleteProduct(id: string): Promise<void> {
    try {
      await api.delete(`/products/${id}`);
    } catch (error) {
      if (!isNotImplementedError(error)) {
        throw error;
      }

      setLocalProducts(getLocalProducts().filter((product) => product.id !== id));
    }
  },

  async uploadImage(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadImageResponse> {
    const formData = new FormData();
    formData.append('image', file);

    const { data } = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (event) => {
        if (!event.total) {
          return;
        }

        onProgress?.(Math.round((event.loaded / event.total) * 100));
      },
    });

    return parseUploadResponse(data);
  },
};
