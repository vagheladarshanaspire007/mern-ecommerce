/**
 * ============================================================
 * Product Routes — src/routes/product.routes.ts
 * ============================================================
 * Day 41-43 focus: Implement these endpoints for the e-commerce platform.
 *
 * Routes:
 *   GET    /api/v1/products           → List products (paginated, filtered)
 *   GET    /api/v1/products/:id       → Get single product
 *   POST   /api/v1/products           → Create product (admin only)
 *   PUT    /api/v1/products/:id       → Replace product (admin only)
 *   PATCH  /api/v1/products/:id       → Update product fields (admin only)
 *   DELETE /api/v1/products/:id       → Delete product (admin only)
 * ============================================================
 */

import { Router } from 'express';
import { authenticate, authorize, optionalAuth } from '../middleware/auth/authenticate';

// TODO: import product validators and controllers
// import { createProductSchema, updateProductSchema } from '../validators/product.validator';
// import { listProducts, getProduct, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller';

const router = Router();

// Public (with optional auth to show wishlist status)
router.get('/', optionalAuth, (_req, res) =>
  res.status(501).json({ message: 'TODO: Implement listProducts — use cursor pagination + Redis cache' })
);

router.get('/:id', optionalAuth, (_req, res) =>
  res.status(501).json({ message: 'TODO: Implement getProduct — cache individual product' })
);

// Admin only
router.post('/', authenticate, authorize('admin'), (_req, res) =>
  res.status(501).json({ message: 'TODO: Implement createProduct — invalidate product list cache after creation' })
);

router.patch('/:id', authenticate, authorize('admin'), (_req, res) =>
  res.status(501).json({ message: 'TODO: Implement updateProduct' })
);

router.delete('/:id', authenticate, authorize('admin'), (_req, res) =>
  res.status(501).json({ message: 'TODO: Implement deleteProduct' })
);

export { router as productRouter };
