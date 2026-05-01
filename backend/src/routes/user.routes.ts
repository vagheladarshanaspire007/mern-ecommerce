/**
 * User Routes — src/routes/user.routes.ts
 */
import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth/authenticate';
import { listUsers } from '../models/user.model';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// All user routes require authentication
router.use(authenticate);

router.get('/profile', (_req, res) =>
  res.status(501).json({ message: 'TODO: Get current user profile' })
);

router.patch('/profile', (_req, res) =>
  res.status(501).json({ message: 'TODO: Update current user profile' })
);

router.patch('/change-password', (_req, res) =>
  res.status(501).json({ message: 'TODO: Change password (require current password)' })
);

// Admin only
router.get(
  '/',
  authorize('admin'),
  asyncHandler(async (_req, res) => {
    const users = await listUsers();

    res.status(200).json({
      success: true,
      data: {
        items: users,
      },
    });
  })
);

router.delete('/:id', authorize('admin'), (_req, res) =>
  res.status(501).json({ message: 'TODO: Delete user (admin)' })
);

export { router as userRouter };
