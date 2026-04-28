import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { AppError } from '../utils/AppError';

const UPLOAD_ROOT = path.resolve(process.cwd(), 'uploads');
const UPLOAD_IMAGES_DIR = path.join(UPLOAD_ROOT, 'images');

export const compressAndStoreImage = async (inputFilePath: string, originalFileName: string) => {
  await fs.mkdir(UPLOAD_IMAGES_DIR, { recursive: true });

  const outputFileName = `${path.parse(originalFileName).name}.webp`;
  const outputFilePath = path.join(UPLOAD_IMAGES_DIR, outputFileName);

  try {
    await sharp(inputFilePath)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toFile(outputFilePath);
  } catch (error) {
    throw new AppError(500, 'IMAGE_PROCESSING_FAILED', 'Failed to process uploaded image', error);
  } finally {
    await fs.unlink(inputFilePath).catch(() => undefined);
  }

  return {
    fileName: outputFileName,
    filePath: outputFilePath,
    url: `/uploads/images/${outputFileName}`,
  };
};
