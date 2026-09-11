import api from '@/services/api';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: string;
  stock: number;
  imageUrls: string[];
  isActive: boolean;
  categoryId: string | null;
  categoryName?: string | null;
  averageRating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductReview {
  id: string;
  reviewerFirstName: string;
  rating: number;
  date: string;
  comment: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
}

export interface ProductFilters {
  cursor?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: string;
  inStock?: boolean;
  limit?: number;
}

export interface CreateProductPayload {
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrls: string[];
  categoryId: string | null;
}

export type UpdateProductPayload = Partial<CreateProductPayload>;

interface ProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    nextCursor: string | null;
  };
}

interface ProductReviewsResponse {
  success: boolean;
  data: {
    reviews: ProductReview[];
    hasMore: boolean;
  };
}

interface CategoriesResponse {
  success: boolean;
  data: {
    categories: Category[];
  };
}

interface ProductResponse {
  success: boolean;
  data: {
    product: Product;
  };
}

interface UploadResponse {
  url: string;
}

export const productService = {
  async getProducts(filters: ProductFilters = {}): Promise<ProductsResponse['data']> {
    const response = await api.get<ProductsResponse>('/products', {
      params: filters,
    });

    return response.data.data;
  },

  async getProductReviews(
    productId: string,
    page: number = 1
  ): Promise<ProductReviewsResponse['data']> {
    const response = await api.get<ProductReviewsResponse>(`/products/${productId}/reviews`, {
      params: { page },
    });

    return response.data.data;
  },

  async getCategories(): Promise<Category[]> {
    const response = await api.get<CategoriesResponse>('/products/categories');

    return response.data.data.categories;
  },

  async getProduct(id: string): Promise<Product> {
    const response = await api.get<ProductResponse>(`/products/${id}`);

    return response.data.data.product;
  },

  async createProduct(payload: CreateProductPayload): Promise<Product> {
    const response = await api.post<ProductResponse>('/products', payload);

    return response.data.data.product;
  },

  async updateProduct(id: string, payload: UpdateProductPayload): Promise<Product> {
    const response = await api.patch<ProductResponse>(`/products/${id}`, payload);

    return response.data.data.product;
  },

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  },

  async uploadImage(file: File, onProgress?: (progress: number) => void): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post<UploadResponse>('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (!progressEvent.total || !onProgress) {
          return;
        }

        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);

        onProgress(progress);
      },
    });

    return response.data.url;
  },
};
