import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { validateRequest } from '../middleware/validation/validateRequest';
import { authenticate, authorize } from '../middleware/auth/authenticate';
import {
  createOrderSchema,
  orderIdParamSchema,
  orderListQuerySchema,
  updateOrderStatusSchema,
} from '../validators/order.validator';
import {
  createOrderController,
  getOrderDetailController,
  listOrdersController,
  updateOrderStatusController,
} from '../controllers/order.controller';

const router = Router();

router.post(
  '/',
  authenticate,
  validateRequest(createOrderSchema),
  asyncHandler(createOrderController)
);

router.get(
  '/',
  authenticate,
  validateRequest(orderListQuerySchema, 'query'),
  asyncHandler(listOrdersController)
);

router.get(
  '/:id',
  authenticate,
  validateRequest(orderIdParamSchema, 'params'),
  asyncHandler(getOrderDetailController)
);

router.patch(
  '/:id/status',
  authenticate,
  authorize('admin'),
  validateRequest(orderIdParamSchema, 'params'),
  validateRequest(updateOrderStatusSchema),
  asyncHandler(updateOrderStatusController)
);

export { router as orderRouter };
