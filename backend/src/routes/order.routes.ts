import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth/authenticate';
import { validateRequest } from '../middleware/validation/validateRequest';
import {
  createOrder,
  listOrders,
  getOrder,
  updateOrderStatus,
} from '../controllers/order.controller';
import {
  createOrderSchema,
  listOrdersSchema,
  orderIdSchema,
  updateOrderStatusSchema,
} from '../validators/order.validator';

const router = Router();

router.use(authenticate);

router.post('/', validateRequest(createOrderSchema), (req, res, next) => {
  void createOrder(req, res).catch(next);
});

router.get('/', validateRequest(listOrdersSchema, 'query'), (req, res, next) => {
  void listOrders(req, res).catch(next);
});

router.get('/:id', validateRequest(orderIdSchema, 'params'), (req, res, next) => {
  void getOrder(req, res).catch(next);
});

router.patch(
  '/:id/status',
  authorize('admin'),
  validateRequest(orderIdSchema, 'params'),
  validateRequest(updateOrderStatusSchema),
  (req, res, next) => {
    void updateOrderStatus(req, res).catch(next);
  }
);

export { router as orderRouter };
