import { z } from 'zod';

const uuidField = z.string().uuid('Invalid ID format');

const productNameField = z.string().trim().min(1, 'Product name is required').max(255);
const descriptionField = z.string().trim().max(5000).optional();
const priceField = z.coerce.number().positive('Price must be greater than 0');
const stockField = z.coerce
  .number()
  .int('Stock must be an integer')
  .min(0, 'Stock cannot be negative');
const imageUrlsField = z.array(z.string().url('Invalid image URL')).optional();
const categoryIdField = uuidField;

const cursorField = z.string().min(1).optional();

export const productIdParamSchema = z.object({
  id: uuidField,
});

export const createProductSchema = z.object({
  name: productNameField,
  description: descriptionField.optional(),
  imageUrls: imageUrlsField,
  price: priceField,
  stock: stockField,
  categoryId: categoryIdField,
});

export const updateProductSchema = z
  .object({
    name: productNameField.optional(),
    description: descriptionField.optional(),
    imageUrls: imageUrlsField,
    price: z.coerce.number().positive('Price must be greater than 0').optional(),
    stock: z.coerce
      .number()
      .int('Stock must be an integer')
      .min(0, 'Stock cannot be negative')
      .optional(),
    categoryId: categoryIdField.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export const productListQuerySchema = z
  .object({
    search: z.string().trim().min(1).max(255).optional(),
    minPrice: z.coerce.number().min(0, 'minPrice cannot be negative').optional(),
    maxPrice: z.coerce.number().min(0, 'maxPrice cannot be negative').optional(),
    categoryId: uuidField.optional(),
    inStock: z.union([z.literal('true'), z.literal('false')]).optional(),
    limit: z.coerce.number().int('limit must be an integer').min(1).max(100).default(20),
    cursor: cursorField,
  })
  .refine(
    (data) => {
      if (data.minPrice !== undefined && data.maxPrice !== undefined) {
        return data.minPrice <= data.maxPrice;
      }
      return true;
    },
    {
      message: 'minPrice cannot be greater than maxPrice',
      path: ['minPrice'],
    }
  );

export type ProductIdParams = z.infer<typeof productIdParamSchema>;
export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
export type ProductListQueryDto = z.infer<typeof productListQuerySchema>;
