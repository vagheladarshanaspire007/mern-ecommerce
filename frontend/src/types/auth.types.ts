/**
 * ============================================================
 * Shared TypeScript Types — src/types/
 * ============================================================
 * WHY centralized types:
 *   Single source of truth — change User type here, all components
 *   instantly get type errors if they're out of sync.
 *   Mirror your backend types as closely as possible.
 * ============================================================
 */

// ── auth.types.ts ─────────────────────────────────────────────

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl?: string;
  role: 'user' | 'admin' | 'manager';
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

// ── api.types.ts ──────────────────────────────────────────────

/** Standard API response envelope from our backend */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/** Standard API error envelope from our backend */
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}

/** Paginated response shape */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  nextCursor?: string; // For cursor-based pagination
}

// ── product.types.ts ─────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrls: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  cursor?: string;
  limit?: number;
}

// ── order.types.ts ────────────────────────────────────────────

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}
