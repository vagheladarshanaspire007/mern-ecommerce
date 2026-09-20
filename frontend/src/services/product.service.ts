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

interface ProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    nextCursor: string | null;
  };
}

interface CategoriesResponse {
  success: boolean;
  data: {
    categories: Category[];
  };
}

export const productService = {
  async getProducts(filters: ProductFilters = {}): Promise<ProductsResponse['data']> {
    const response = await api.get<ProductsResponse>('/products', {
      params: filters,
    });

    return response.data.data;
  },

  async getCategories(): Promise<Category[]> {
    const response = await api.get<CategoriesResponse>('/products/categories');

    return response.data.data.categories;
  },

  async getProduct(id: string): Promise<Product> {
    const response = await api.get<{
      success: boolean;
      data: Product;
    }>(`/products/${id}`);

    return response.data.data;
  },
};
