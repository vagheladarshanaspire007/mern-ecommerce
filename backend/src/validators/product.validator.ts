import { z } from 'zod';

const uuidField = z.string().uuid('Invalid UUID');

export const listProductsSchema = z.object({
  cursor: z.string().optional(),
  search: z.string().trim().max(255).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  categoryId: uuidField.optional(),
  inStock: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const productIdSchema = z.object({
  id: uuidField,
});

const productFields = {
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().max(5000).nullable().optional(),
  price: z.number().min(0),
  stock: z.number().int().min(0),
  imageUrls: z.array(z.string().url()).default([]),
  categoryId: uuidField.nullable().optional(),
};

export const createProductSchema = z.object({
  name: productFields.name,
  description: productFields.description,
  price: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0),
  imageUrls: productFields.imageUrls,
  categoryId: productFields.categoryId,
});

export const updateProductSchema = z
  .object({
    name: productFields.name.optional(),
    description: productFields.description,
    price: z.coerce.number().min(0).optional(),
    stock: z.coerce.number().int().min(0).optional(),
    imageUrls: z.array(z.string().url()).optional(),
    categoryId: productFields.categoryId,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export type ListProductsDto = z.infer<typeof listProductsSchema>;
export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
