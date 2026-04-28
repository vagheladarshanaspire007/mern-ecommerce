import { Request, Response } from 'express';
import { AppError } from '../utils/AppError';
import { compressAndStoreImage } from '../services/upload.service';

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    throw new AppError(400, 'NO_FILE_UPLOADED', 'Please upload an image file');
  }

  const result = await compressAndStoreImage(req.file.path, req.file.filename);

  res.status(200).json({ url: result.url });
};
