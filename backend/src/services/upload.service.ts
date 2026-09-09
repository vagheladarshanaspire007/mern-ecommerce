import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { AppError } from '../utils/AppError';

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const IMAGE_UPLOAD_DIR = path.join(UPLOAD_DIR, 'images');

export const compressImage = async (inputPath: string): Promise<string> => {
  const outputFilename = `${path.parse(inputPath).name}.webp`;
  const outputPath = path.join(IMAGE_UPLOAD_DIR, outputFilename);

  try {
    await sharp(inputPath)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toFile(outputPath);

    await fs.unlink(inputPath);

    return `/uploads/images/${outputFilename}`;
  } catch (error) {
    await fs.unlink(inputPath).catch(() => undefined);

    throw new AppError(
      500,
      'IMAGE_PROCESSING_FAILED',
      'Failed to compress uploaded image',
      error instanceof Error ? error.message : undefined
    );
  }
};
