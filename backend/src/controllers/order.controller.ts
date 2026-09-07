import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import type { OrderItemInput, OrderStatus } from '../models/order.model';

interface CreateOrderBody {
  items: OrderItemInput[];
}

interface UpdateOrderStatusBody {
  status: OrderStatus;
}

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  const order = await OrderService.create(req.user!.userId, (req.body as CreateOrderBody).items);

  res.status(201).json({
    success: true,
    data: { order },
  });
};

export const listOrders = async (req: Request, res: Response): Promise<void> => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);

  const result = await OrderService.list(req.user!.userId, page, limit);

  res.json({
    success: true,
    data: result,
  });
};

export const getOrder = async (req: Request, res: Response): Promise<void> => {
  const order = await OrderService.getById(req.params.id, req.user!.userId);

  res.json({
    success: true,
    data: { order },
  });
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  const order = await OrderService.updateStatus(
    req.params.id,
    (req.body as UpdateOrderStatusBody).status
  );

  res.json({
    success: true,
    data: { order },
  });
};
