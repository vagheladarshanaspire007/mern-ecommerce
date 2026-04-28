import { api } from '@/services/api';

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ProductListItem {
  id: string;
  name: string;
  description: string | null;
  imageUrls: string[];
  price: string;
  stock: number;
  categoryId: string;
  category: ProductCategory;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductQueryParams {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  inStock?: boolean;
  cursor?: string;
  limit?: number;
}

export interface ProductListResponse {
  items: ProductListItem[];
  nextCursor: string | null;
}

type ListProductsApiResponse = {
  data: ProductListItem[];
  pagination?: {
    nextCursor?: string | null;
  };
};

type CategoriesApiResponse = {
  data: ProductCategory[];
};

const DEFAULT_LIMIT = 20;

export async function fetchProducts(params: ProductQueryParams): Promise<ProductListResponse> {
  const response = await api.get<ListProductsApiResponse>('/products', {
    params: {
      search: params.search || undefined,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      categoryId: params.category || undefined,
      inStock: typeof params.inStock === 'boolean' ? String(params.inStock) : undefined,
      cursor: params.cursor || undefined,
      limit: params.limit ?? DEFAULT_LIMIT,
    },
  });

  return {
    items: response.data.data,
    nextCursor: response.data.pagination?.nextCursor ?? null,
  };
}

export async function fetchCategories(): Promise<ProductCategory[]> {
  const response = await api.get<CategoriesApiResponse>('/products/categories');
  return response.data.data;
}
