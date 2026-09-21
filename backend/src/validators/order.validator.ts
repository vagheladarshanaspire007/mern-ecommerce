import { z } from 'zod';

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
  shippingAddress: z.object({
    fullName: z.string().trim().min(2).max(100),
    address: z.string().trim().min(5).max(255),
    city: z.string().trim().min(2).max(100),
    state: z.string().trim().min(2).max(100),
    pin: z.string().regex(/^\d{6}$/),
    phone: z.string().regex(/^[+]?\d{10,15}$/),
  }),
});

export const orderIdSchema = z.object({
  id: z.string().uuid(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
});

export const listOrdersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusDto = z.infer<typeof updateOrderStatusSchema>;
export type ListOrdersDto = z.infer<typeof listOrdersSchema>;
