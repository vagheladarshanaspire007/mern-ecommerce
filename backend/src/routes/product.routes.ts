import { Router } from 'express';
import { validateRequest } from '../middleware/validation/validateRequest';
import {
  createProductSchema,
  productIdParamSchema,
  productListQuerySchema,
  updateProductSchema,
} from '../validators/product.validator';
import {
  createProductController,
  deleteProductController,
  getCategoriesController,
  getProductByIdController,
  listProductsController,
  updateProductController,
} from '../controllers/product.controller';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate, authorize, optionalAuth } from '@/middleware/auth/authenticate';

const router = Router();

// Public routes
router.get('/categories', optionalAuth, asyncHandler(getCategoriesController));

router.get(
  '/',
  optionalAuth,
  validateRequest(productListQuerySchema, 'query'),
  asyncHandler(listProductsController)
);

router.get(
  '/:id',
  optionalAuth,
  validateRequest(productIdParamSchema, 'params'),
  asyncHandler(getProductByIdController)
);

// Admin-only routes
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validateRequest(createProductSchema),
  asyncHandler(createProductController)
);

router.patch(
  '/:id',
  authenticate,
  authorize('admin'),
  validateRequest(productIdParamSchema, 'params'),
  validateRequest(updateProductSchema),
  asyncHandler(updateProductController)
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validateRequest(productIdParamSchema, 'params'),
  asyncHandler(deleteProductController)
);

export { router as productRouter };
