import type {
  ApiResponse,
  Category,
  PaginatedResponse,
  Product,
  ProductMutationPayload,
  UploadImageResponse,
} from '@/types/auth.types';
import api from './api';

type ProductLike = Partial<Product> & Pick<Product, 'id' | 'name'>;

function unwrapData<T>(response: T | ApiResponse<T>): T {
  if (typeof response === 'object' && response !== null && 'data' in response) {
    return response.data;
  }

  return response;
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

function normalizeProducts(response: ProductLike[] | PaginatedResponse<ProductLike>): Product[] {
  const items = Array.isArray(response) ? response : response.items;
  return items.map(normalizeProduct);
}

function normalizeCategories(response: Category[] | { categories: Category[] }): Category[] {
  return Array.isArray(response) ? response : response.categories;
}

function normalizeUploadResponse(
  response:
    | UploadImageResponse
    | {
        imageUrl?: string;
        file?: { path?: string };
      }
): UploadImageResponse {
  const url =
    ('url' in response ? response.url : undefined) ??
    ('imageUrl' in response ? response.imageUrl : undefined) ??
    ('file' in response ? response.file?.path : undefined);

  if (!url) {
    throw new Error('Upload completed but the server did not return an image URL.');
  }

  return { url };
}

export const productService = {
  async getProductById(id: string): Promise<Product> {
    const { data } = await api.get<ApiResponse<ProductLike> | ProductLike>(`/products/${id}`);
    return normalizeProduct(unwrapData(data));
  },

  async listProducts(): Promise<Product[]> {
    const { data } = await api.get<
      | ApiResponse<ProductLike[] | PaginatedResponse<ProductLike>>
      | ProductLike[]
      | PaginatedResponse<ProductLike>
    >('/products');
    return normalizeProducts(unwrapData(data));
  },

  async getProductCategories(): Promise<Category[]> {
    const { data } = await api.get<
      ApiResponse<Category[] | { categories: Category[] }> | Category[]
    >('/products/categories');
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
