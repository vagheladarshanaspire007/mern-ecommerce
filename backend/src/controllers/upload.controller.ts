import { Request, Response } from 'express';
import { AppError } from '../utils/AppError';
import { compressImage } from '../services/upload.service';

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    throw new AppError(400, 'FILE_REQUIRED', 'An image file is required');
  }

  const url = await compressImage(req.file.path);

  res.status(200).json({ url });
};
