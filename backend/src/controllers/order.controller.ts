import { Request, Response } from 'express';
import {
  createOrderService,
  getOrderDetailService,
  listOrdersService,
  updateOrderStatusService,
} from '../services/order.service';
import {
  type CreateOrderDto,
  type OrderListQueryDto,
  type UpdateOrderStatusDto,
} from '../validators/order.validator';
import { t } from '../utils/i18n';
import { ORDER_MESSAGES } from '../constants/messages';

type OrderParams = {
  id: string;
};

type AuthUser = {
  userId: string;
  role: string;
};

type AuthRequest<TBody = unknown, TQuery = unknown> = Request<
  OrderParams,
  unknown,
  TBody,
  TQuery
> & {
  user?: AuthUser;
};

type CreateOrderBody = CreateOrderDto;
type ListOrdersQuery = OrderListQueryDto;
type UpdateOrderStatusBody = UpdateOrderStatusDto;

export async function createOrderController(
  req: AuthRequest<CreateOrderBody>,
  res: Response
): Promise<void> {
  const user = req.user;

  if (!user) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: t(ORDER_MESSAGES.UNAUTHORIZED),
      },
    });
    return;
  }

  const result = await createOrderService({
    userId: user.userId,
    items: req.body.items,
    shippingAddress: req.body.shippingAddress,
  });

  res.status(201).json({
    success: true,
    message: t(ORDER_MESSAGES.ORDER_CREATED),
    data: {
      order: result.order,
    },
  });
}

export async function listOrdersController(
  req: AuthRequest<unknown, ListOrdersQuery>,
  res: Response
): Promise<void> {
  const user = req.user;

  if (!user) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: t(ORDER_MESSAGES.UNAUTHORIZED),
      },
    });
    return;
  }

  const page = req.query.page;
  const limit = req.query.limit;

  const result = await listOrdersService(user.userId, user.role, page, limit);

  res.status(200).json({
    success: true,
    data: {
      items: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        hasNextPage: result.page * result.limit < result.total,
      },
    },
  });
}

export async function getOrderDetailController(req: AuthRequest, res: Response): Promise<void> {
  const user = req.user;

  if (!user) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: t(ORDER_MESSAGES.UNAUTHORIZED),
      },
    });
    return;
  }

  const order = await getOrderDetailService(user.userId, req.params.id, user.role === 'admin');

  res.status(200).json({
    success: true,
    data: {
      order,
    },
  });
}

export async function updateOrderStatusController(
  req: AuthRequest<UpdateOrderStatusBody>,
  res: Response
): Promise<void> {
  const user = req.user;

  if (!user) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: t(ORDER_MESSAGES.UNAUTHORIZED),
      },
    });
    return;
  }

  const result = await updateOrderStatusService({
    orderId: req.params.id,
    status: req.body.status,
    actorRole: user.role,
  });

  res.status(200).json({
    success: true,
    data: {
      orderId: result.id,
      userId: result.userId,
      status: result.status,
    },
  });
}
