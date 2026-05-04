import { query } from '../config/database';

export type ProductCategory = {
  id: string;
  name: string;
  slug: string;
};

export type ProductListItem = {
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
};

export type ProductDetail = ProductListItem & {
  averageRating: number;
  reviewCount: number;
};

export type ProductListFilters = {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: string;
  inStock?: boolean;
};

export type ProductCursor = {
  createdAt: string;
  id: string;
};

export type CreateProductInput = {
  name: string;
  description?: string | null;
  imageUrls?: string[];
  price: number;
  stock: number;
  categoryId: string;
};

export type UpdateProductInput = Partial<CreateProductInput>;

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  image_urls: string[];
  price: string;
  stock: number;
  category_id: string;
  category_name: string;
  category_slug: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type ProductDetailRow = ProductRow & {
  average_rating: string | null;
  review_count: string;
};

const mapProductRow = (row: ProductRow): ProductListItem => ({
  id: row.id,
  name: row.name,
  description: row.description,
  imageUrls: row.image_urls ?? [],
  price: row.price,
  stock: row.stock,
  categoryId: row.category_id,
  category: {
    id: row.category_id,
    name: row.category_name,
    slug: row.category_slug,
  },
  isActive: row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapProductDetailRow = (row: ProductDetailRow): ProductDetail => ({
  ...mapProductRow(row),
  averageRating: row.average_rating ? Number(row.average_rating) : 0,
  reviewCount: Number(row.review_count),
});

export async function findProducts(
  filters: ProductListFilters,
  cursor: ProductCursor | null,
  limit: number
): Promise<{ data: ProductListItem[]; nextCursor: ProductCursor | null; hasMore: boolean }> {
  const where: string[] = ['p.is_active = TRUE'];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (filters.search) {
    where.push(`(p.name ILIKE $${paramIndex} OR COALESCE(p.description, '') ILIKE $${paramIndex})`);
    params.push(`%${filters.search}%`);
    paramIndex += 1;
  }

  if (typeof filters.minPrice === 'number') {
    where.push(`p.price >= $${paramIndex}`);
    params.push(filters.minPrice);
    paramIndex += 1;
  }

  if (typeof filters.maxPrice === 'number') {
    where.push(`p.price <= $${paramIndex}`);
    params.push(filters.maxPrice);
    paramIndex += 1;
  }

  if (filters.categoryId) {
    where.push(`p.category_id = $${paramIndex}`);
    params.push(filters.categoryId);
    paramIndex += 1;
  }

  if (filters.inStock === true) {
    where.push('p.stock > 0');
  } else if (filters.inStock === false) {
    where.push('p.stock = 0');
  }

  if (cursor) {
    where.push(`(p.created_at, p.id) < ($${paramIndex}, $${paramIndex + 1})`);
    params.push(cursor.createdAt, cursor.id);
    paramIndex += 2;
  }

  params.push(limit + 1);

  const result = await query<ProductRow>(
    `
      SELECT
        p.id,
        p.name,
        p.description,
        p.image_urls,
        p.price::text AS price,
        p.stock,
        p.category_id,
        c.name AS category_name,
        c.slug AS category_slug,
        p.is_active,
        p.created_at::text AS created_at,
        p.updated_at::text AS updated_at
      FROM products p
      INNER JOIN categories c ON c.id = p.category_id
      WHERE ${where.join(' AND ')}
      ORDER BY p.created_at DESC, p.id DESC
      LIMIT $${paramIndex}
    `,
    params
  );

  const rows = result.rows;
  const hasMore = rows.length > limit;
  const items = rows.slice(0, limit).map(mapProductRow);
  const lastItem = items.length > 0 ? items[items.length - 1] : undefined;

  return {
    data: items,
    nextCursor: hasMore && lastItem ? { createdAt: lastItem.createdAt, id: lastItem.id } : null,
    hasMore,
  };
}

export async function findProductById(id: string): Promise<ProductDetail | null> {
  const result = await query<ProductDetailRow>(
    `
      SELECT
        p.id,
        p.name,
        p.description,
        p.image_urls,
        p.price::text AS price,
        p.stock,
        p.category_id,
        c.name AS category_name,
        c.slug AS category_slug,
        p.is_active,
        p.created_at::text AS created_at,
        p.updated_at::text AS updated_at,
        COALESCE(AVG(r.rating), 0) AS average_rating,
        COUNT(r.id) AS review_count
      FROM products p
      INNER JOIN categories c ON c.id = p.category_id
      LEFT JOIN reviews r ON r.product_id = p.id
      WHERE p.id = $1 AND p.is_active = TRUE
      GROUP BY p.id, c.id
      LIMIT 1
    `,
    [id]
  );

  return result.rows[0] ? mapProductDetailRow(result.rows[0]) : null;
}

export async function findCategories(): Promise<ProductCategory[]> {
  const result = await query<ProductCategory>(
    `
      SELECT id, name, slug
      FROM categories
      ORDER BY name ASC
    `
  );

  return result.rows;
}

export async function createProduct(input: CreateProductInput): Promise<ProductListItem | null> {
  const result = await query<ProductRow>(
    `
      INSERT INTO products (name, description, image_urls, price, stock, category_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        name,
        description,
        image_urls,
        price::text AS price,
        stock,
        category_id,
        is_active,
        created_at::text AS created_at,
        updated_at::text AS updated_at
    `,
    [
      input.name,
      input.description ?? null,
      input.imageUrls ?? [],
      input.price,
      input.stock,
      input.categoryId,
    ]
  );

  const row = result.rows[0];
  if (!row) return null;

  const category = await query<{ id: string; name: string; slug: string }>(
    `
      SELECT id, name, slug
      FROM categories
      WHERE id = $1
      LIMIT 1
    `,
    [row.category_id]
  );

  const categoryRow = category.rows[0];
  if (!categoryRow) return null;

  return mapProductRow({
    ...row,
    category_name: categoryRow.name,
    category_slug: categoryRow.slug,
  });
}

export async function updateProduct(
  id: string,
  input: UpdateProductInput
): Promise<ProductListItem | null> {
  const fields: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (input.name !== undefined) {
    fields.push(`name = $${paramIndex}`);
    params.push(input.name);
    paramIndex += 1;
  }

  if (input.description !== undefined) {
    fields.push(`description = $${paramIndex}`);
    params.push(input.description);
    paramIndex += 1;
  }

  if (input.imageUrls !== undefined) {
    fields.push(`image_urls = COALESCE(image_urls, '{}') || $${paramIndex}::text[]`);
    params.push(input.imageUrls);
    paramIndex += 1;
  }

  if (input.price !== undefined) {
    fields.push(`price = $${paramIndex}`);
    params.push(input.price);
    paramIndex += 1;
  }

  if (input.stock !== undefined) {
    fields.push(`stock = $${paramIndex}`);
    params.push(input.stock);
    paramIndex += 1;
  }

  if (input.categoryId !== undefined) {
    fields.push(`category_id = $${paramIndex}`);
    params.push(input.categoryId);
    paramIndex += 1;
  }

  if (fields.length === 0) {
    return findProductById(id);
  }

  fields.push(`updated_at = NOW()`);
  params.push(id);

  const result = await query<ProductRow>(
    `
      UPDATE products
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex} AND is_active = TRUE
      RETURNING
        id,
        name,
        description,
        image_urls,
        price::text AS price,
        stock,
        category_id,
        is_active,
        created_at::text AS created_at,
        updated_at::text AS updated_at
    `,
    params
  );

  const row = result.rows[0];
  if (!row) return null;

  const category = await query<{ id: string; name: string; slug: string }>(
    `
      SELECT id, name, slug
      FROM categories
      WHERE id = $1
      LIMIT 1
    `,
    [row.category_id]
  );

  const categoryRow = category.rows[0];
  if (!categoryRow) return null;

  return mapProductRow({
    ...row,
    category_name: categoryRow.name,
    category_slug: categoryRow.slug,
  });
}

export async function softDeleteProduct(id: string): Promise<boolean> {
  const result = await query<{ id: string }>(
    `
      UPDATE products
      SET is_active = FALSE,
          updated_at = NOW()
      WHERE id = $1 AND is_active = TRUE
      RETURNING id
    `,
    [id]
  );

  return result.rows.length > 0;
}
