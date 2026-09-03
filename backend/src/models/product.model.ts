import { query } from '../config/database';

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
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductInput {
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  imageUrls?: string[];
  categoryId?: string | null;
}

export interface ProductUpdateInput {
  name?: string;
  description?: string | null;
  price?: number;
  stock?: number;
  imageUrls?: string[];
  categoryId?: string | null;
}

export const ProductModel = {
  findMany: async (
    where: string,
    params: unknown[],
    limit: number
  ): Promise<Product[]> => {
    const { rows } = await query<Product>(
      `
        SELECT
          p.id,
          p.name,
          p.description,
          p.price,
          p.stock,
          p.image_urls AS "imageUrls",
          p.is_active AS "isActive",
          p.category_id AS "categoryId",
          c.name AS "categoryName",
          p.created_at AS "createdAt",
          p.updated_at AS "updatedAt"
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE p.is_active = TRUE
          ${where}
        ORDER BY p.created_at DESC, p.id DESC
        LIMIT $${params.length + 1}
      `,
      [...params, limit]
    );

    return rows;
  },

  findById: async (id: string): Promise<Product | null> => {
    const { rows } = await query<Product>(
      `
        SELECT
          p.id,
          p.name,
          p.description,
          p.price,
          p.stock,
          p.image_urls AS "imageUrls",
          p.is_active AS "isActive",
          p.category_id AS "categoryId",
          c.name AS "categoryName",
          COALESCE(AVG(r.rating), 0)::numeric(3,2) AS "averageRating",
          COUNT(r.id)::integer AS "reviewCount",
          p.created_at AS "createdAt",
          p.updated_at AS "updatedAt"
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        LEFT JOIN reviews r ON r.product_id = p.id
        WHERE p.id = $1
          AND p.is_active = TRUE
        GROUP BY p.id, c.name
        LIMIT 1
      `,
      [id]
    );

    return rows[0] ?? null;
  },

  create: async (data: ProductInput): Promise<Product> => {
    const { rows } = await query<Product>(
      `
        INSERT INTO products (
          name, description, price, stock, image_urls, category_id
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING
          id,
          name,
          description,
          price,
          stock,
          image_urls AS "imageUrls",
          is_active AS "isActive",
          category_id AS "categoryId",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
      `,
      [
        data.name,
        data.description ?? null,
        data.price,
        data.stock,
        data.imageUrls ?? [],
        data.categoryId ?? null,
      ]
    );

    return rows[0];
  },

  update: async (id: string, data: ProductUpdateInput): Promise<Product | null> => {
    const fields: string[] = [];
    const params: unknown[] = [];

    const addField = (column: string, value: unknown) => {
      params.push(value);
      fields.push(`${column} = $${params.length}`);
    };

    if (data.name !== undefined) addField('name', data.name);
    if (data.description !== undefined) addField('description', data.description);
    if (data.price !== undefined) addField('price', data.price);
    if (data.stock !== undefined) addField('stock', data.stock);
    if (data.imageUrls !== undefined) addField('image_urls', data.imageUrls);
    if (data.categoryId !== undefined) addField('category_id', data.categoryId);

    if (fields.length === 0) {
      return ProductModel.findById(id);
    }

    fields.push('updated_at = NOW()');
    params.push(id);

    const { rows } = await query<Product>(
      `
        UPDATE products
        SET ${fields.join(', ')}
        WHERE id = $${params.length}
          AND is_active = TRUE
        RETURNING
          id,
          name,
          description,
          price,
          stock,
          image_urls AS "imageUrls",
          is_active AS "isActive",
          category_id AS "categoryId",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
      `,
      params
    );

    return rows[0] ?? null;
  },

  softDelete: async (id: string): Promise<boolean> => {
    const result = await query(
      `
        UPDATE products
        SET is_active = FALSE,
            updated_at = NOW()
        WHERE id = $1
          AND is_active = TRUE
      `,
      [id]
    );

    return result.rowCount === 1;
  },

  findCategories: async (): Promise<{ id: string; name: string; description: string | null }[]> => {
    const { rows } = await query<{ id: string; name: string; description: string | null }>(
      `
        SELECT id, name, description
        FROM categories
        ORDER BY name ASC
      `
    );

    return rows;
  },
};
