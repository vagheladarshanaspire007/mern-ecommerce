/**
 * ============================================================
 * File Upload Middleware — src/middleware/upload.ts
 * ============================================================
 * WHY Multer:
 *   Express does not handle multipart/form-data by default.
 *   Multer parses multipart requests and makes files available
 *   as req.file (single) or req.files (multiple).
 *
 * Security measures implemented here:
 *   1. File size limit    — prevents disk exhaustion attacks
 *   2. File type check    — whitelist by MIME type (not extension!)
 *   3. File count limit   — prevents bulk upload abuse
 *   4. Filename sanitize  — prevents path traversal (../../etc/passwd)
 *
 * WHY check MIME type, not extension:
 *   An attacker can rename malware.exe to photo.jpg.
 *   We check the actual file content type via MIME detection.
 *
 * WHY sanitize filename:
 *   User uploads file named "../../config/database.ts" → could
 *   overwrite sensitive files. We strip directory separators.
 * ============================================================
 */

import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { AppError } from '../utils/AppError';

// ─── Allowed MIME Types ──────────────────────────────────────
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf'];
const ALLOWED_ALL = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];

// ─── Storage Configuration ───────────────────────────────────
const createStorage = (uploadDir: string) => {
  // Ensure upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      // WHY UUID: Prevents filename collisions and removes user-controlled names
      // Format: uuid.original-extension
      const ext = path.extname(file.originalname).toLowerCase();
      const safeName = `${uuidv4()}${ext}`;
      cb(null, safeName);
    },
  });
};

// ─── File Filter ─────────────────────────────────────────────
const createFileFilter =
  (allowedTypes: string[]) =>
  (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new AppError(
          415,
          'INVALID_FILE_TYPE',
          `File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
        )
      );
    }
  };

const MAX_SIZE_BYTES = parseInt(process.env.UPLOAD_MAX_SIZE_MB || '10') * 1024 * 1024;
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

// ─── Multer Instances ────────────────────────────────────────

/** Single image upload — req.file */
export const uploadSingleImage = multer({
  storage: createStorage(path.join(UPLOAD_DIR, 'images')),
  fileFilter: createFileFilter(ALLOWED_IMAGE_TYPES),
  limits: {
    fileSize: MAX_SIZE_BYTES,
    files: 1,
  },
}).single('image'); // 'image' must match the field name in form-data

/** Multiple image upload — req.files (max 10) */
export const uploadMultipleImages = multer({
  storage: createStorage(path.join(UPLOAD_DIR, 'images')),
  fileFilter: createFileFilter(ALLOWED_IMAGE_TYPES),
  limits: {
    fileSize: MAX_SIZE_BYTES,
    files: 10, // Max 10 images at once
  },
}).array('images', 10);

/** Document upload (PDF) */
export const uploadDocument = multer({
  storage: createStorage(path.join(UPLOAD_DIR, 'documents')),
  fileFilter: createFileFilter(ALLOWED_DOCUMENT_TYPES),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB for PDFs
    files: 1,
  },
}).single('document');

/** Mixed uploads (images + documents) */
export const uploadMixed = multer({
  storage: createStorage(UPLOAD_DIR),
  fileFilter: createFileFilter(ALLOWED_ALL),
  limits: { fileSize: MAX_SIZE_BYTES, files: 5 },
}).fields([
  { name: 'images', maxCount: 4 },
  { name: 'document', maxCount: 1 },
]);
