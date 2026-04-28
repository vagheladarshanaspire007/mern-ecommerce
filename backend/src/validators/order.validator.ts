import { z } from 'zod';

export const shippingAddressSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required'),
  address: z.string().trim().min(1, 'Address is required'),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().min(1, 'State is required'),
  pin: z.string().trim().min(1, 'PIN is required'),
  phone: z.string().trim().min(1, 'Phone is required'),
});

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid('Invalid product id'),
        quantity: z.number().int().positive('Quantity must be at least 1'),
      })
    )
    .min(1, 'At least one item is required'),
  shippingAddress: shippingAddressSchema,
});

export const orderIdParamSchema = z.object({
  id: z.string().uuid('Invalid order id'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'shipped', 'delivered', 'cancelled']),
});

export const orderListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusDto = z.infer<typeof updateOrderStatusSchema>;
export type OrderListQueryDto = z.infer<typeof orderListQuerySchema>;
export type ShippingAddressDto = z.infer<typeof shippingAddressSchema>;
