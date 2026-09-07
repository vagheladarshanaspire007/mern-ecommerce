import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth/authenticate';
import {
  createOrder,
  listOrders,
  getOrder,
  updateOrderStatus,
} from '../controllers/order.controller';

const router = Router();

router.use(authenticate);

router.post('/', (req, res, next) => {
  void createOrder(req, res).catch(next);
});

router.get('/', (req, res, next) => {
  void listOrders(req, res).catch(next);
});

router.get('/:id', (req, res, next) => {
  void getOrder(req, res).catch(next);
});

router.patch('/:id/status', authorize('admin'), (req, res, next) => {
  void updateOrderStatus(req, res).catch(next);
});

export { router as orderRouter };
