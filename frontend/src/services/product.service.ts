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

// ─── Storage helpers ──────────────────────────────────────────────────────────

function buildStorageProduct(product: Product): Product {
  return { ...product, imageUrls: product.images.map((image) => image.url) };
}

function getLocalStore<T>(key: string, seed: T[]): T[] {
  if (globalThis.window === undefined) return seed;
  const stored = globalThis.window.localStorage.getItem(key);
  if (!stored) {
    globalThis.window.localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(stored) as T[];
  } catch {
    return seed;
  }
}

function getLocalCategories(): Category[] {
  return getLocalStore<Category>(CATEGORIES_STORAGE_KEY, sampleCategories);
}

function getLocalProducts(): Product[] {
  return getLocalStore<Product>(PRODUCTS_STORAGE_KEY, sampleProducts.map(buildStorageProduct));
}

function setLocalProducts(products: Product[]) {
  if (globalThis.window === undefined) return;
  globalThis.window.localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
}

// ─── Normalisation ────────────────────────────────────────────────────────────

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

// ─── Response parsers ─────────────────────────────────────────────────────────

type ShapeFn<T> = (raw: unknown) => T;

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

function parseResponse<T>(response: unknown, shape: ShapeFn<T>): T {
  return shape(unwrapData<unknown>(response));
}

function shapeProduct(raw: unknown): Product {
  return normalizeProduct(raw as Partial<Product> & { id: string; name: string });
}

function shapeProducts(raw: unknown): Product[] {
  const src = raw as {
    items?: Array<Partial<Product> & { id: string; name: string }>;
    products?: Array<Partial<Product> & { id: string; name: string }>;
  };
  return (src.items ?? src.products ?? []).map(normalizeProduct);
}

function shapeCategories(raw: unknown): Category[] {
  if (Array.isArray(raw)) return raw as Category[];
  const src = raw as { items?: Category[]; categories?: Category[] };
  return src.categories ?? src.items ?? [];
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

// ─── Mutation helpers ─────────────────────────────────────────────────────────

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

function isNotImplementedError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'status' in error && error.status === 501;
}

async function withLocalFallback<T>(apiCall: () => Promise<T>, localFallback: () => T): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    if (!isNotImplementedError(error)) throw error;
    return localFallback();
  }
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const productService = {
  async getProductById(id: string): Promise<Product> {
    try {
      const { data } = await api.get<ApiResponse<Product> | Product>(`/products/${id}`);
      return parseResponse(data, shapeProduct);
    } catch {
      const localProduct = getLocalProducts().find((product) => product.id === id);
      if (localProduct) return normalizeProduct(localProduct);
      throw new Error(`Product ${id} not found.`);
    }
  },

  async listProducts(): Promise<Product[]> {
    try {
      const { data } = await api.get<ApiResponse<{ items: Product[] }> | { items: Product[] }>(
        '/products'
      );
      return parseResponse(data, shapeProducts);
    } catch {
      return getLocalProducts().map(normalizeProduct);
    }
  },

  async getProductCategories(): Promise<Category[]> {
    try {
      const { data } = await api.get<ApiResponse<Category[]> | Category[]>('/products/categories');
      return parseResponse(data, shapeCategories);
    } catch {
      return getLocalCategories();
    }
  },

  async createProduct(payload: ProductMutationPayload): Promise<Product> {
    return withLocalFallback(
      async () => {
        const { data } = await api.post<ApiResponse<Product> | Product>('/products', payload);
        return parseResponse(data, shapeProduct);
      },
      () => {
        const next = toMutationResult(payload);
        setLocalProducts([...getLocalProducts(), next]);
        return next;
      }
    );
  },

  async updateProduct(id: string, payload: ProductMutationPayload): Promise<Product> {
    return withLocalFallback(
      async () => {
        const { data } = await api.patch<ApiResponse<Product> | Product>(
          `/products/${id}`,
          payload
        );
        return parseResponse(data, shapeProduct);
      },
      () => {
        const products = getLocalProducts();
        const existing = products.find((p) => p.id === id);
        if (!existing) throw new Error('Product not found.');
        const updated = toMutationResult(payload, existing);
        setLocalProducts(products.map((p) => (p.id === id ? updated : p)));
        return updated;
      }
    );
  },

  async deleteProduct(id: string): Promise<void> {
    return withLocalFallback(
      () => api.delete(`/products/${id}`).then(() => undefined),
      () => {
        setLocalProducts(getLocalProducts().filter((p) => p.id !== id));
      }
    );
  },

  async uploadImage(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadImageResponse> {
    const formData = new FormData();
    formData.append('image', file);

    const { data } = await api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (!event.total) return;
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      },
    });

    return parseUploadResponse(data);
  },
};
