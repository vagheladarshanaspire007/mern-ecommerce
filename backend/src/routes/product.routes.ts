import { Router } from 'express';
import { authenticate, authorize, optionalAuth } from '../middleware/auth/authenticate';
import { validateRequest } from '../middleware/validation/validateRequest';
import {
  listProducts,
  getProduct,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller';
import {
  listProductsSchema,
  productIdSchema,
  createProductSchema,
  updateProductSchema,
} from '../validators/product.validator';

const router = Router();

router.get('/categories', (req, res, next) => {
  void getCategories(req, res).catch(next);
});

router.get('/', optionalAuth, validateRequest(listProductsSchema, 'query'), (req, res, next) => {
  void listProducts(req, res).catch(next);
});

router.get('/:id', optionalAuth, validateRequest(productIdSchema, 'params'), (req, res, next) => {
  void getProduct(req, res).catch(next);
});

router.post(
  '/',
  authenticate,
  authorize('admin'),
  validateRequest(createProductSchema),
  (req, res, next) => {
    void createProduct(req, res).catch(next);
  }
);

router.patch(
  '/:id',
  authenticate,
  authorize('admin'),
  validateRequest(productIdSchema, 'params'),
  validateRequest(updateProductSchema),
  (req, res, next) => {
    void updateProduct(req, res).catch(next);
  }
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validateRequest(productIdSchema, 'params'),
  (req, res, next) => {
    void deleteProduct(req, res).catch(next);
  }
);

export { router as productRouter };
