/**
 * ============================================================
 * Upload Routes — src/routes/upload.routes.ts
 * ============================================================
 * WHY Multer middleware is applied per-route (not globally):
 *   Only file upload routes should parse multipart/form-data.
 *   Applying globally wastes memory on every request.
 * ============================================================
 */
import { Router } from 'express';
import { authenticate } from '../middleware/auth/authenticate';
import { uploadRateLimiter } from '../middleware/security/rateLimiter';
import { uploadSingleImage, uploadMultipleImages } from '../middleware/upload';
import { uploadImage } from '../controllers/upload.controller';
import { asyncHandler } from '../utils/asyncHandler';
const router = Router();

router.post(
  '/image',
  authenticate,
  uploadRateLimiter,
  uploadSingleImage,
  asyncHandler(uploadImage)
);

router.post('/images', authenticate, uploadRateLimiter, uploadMultipleImages, (req, res) => {
  res.status(501).json({
    message: 'TODO: Process multiple images',
    files: req.files,
  });
});

export { router as uploadRouter };
