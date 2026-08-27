import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function getUploadRoot(): string {
  return process.env.UPLOAD_ROOT || join(process.cwd(), 'uploads');
}

export function createMulterConfig(subfolder: string): MulterOptions {
  return {
    storage: diskStorage({
      destination: (req, file, callback) => {
        const uploadDir = join(getUploadRoot(), subfolder);
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        callback(null, uploadDir);
      },
      filename: (req, file, callback) => {
        const fileExt = extname(file.originalname).toLowerCase();
        const baseName = file.originalname
          .replace(fileExt, '')
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-');
        const uniqueId = crypto.randomUUID();
        const safeFilename = `${uniqueId}-${baseName}${fileExt}`;
        callback(null, safeFilename);
      },
    }),
    fileFilter: (req, file, callback) => {
      if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return callback(
          new BadRequestException(
            `Invalid file type: ${file.mimetype}. Allowed types: jpg, jpeg, png, webp, gif, svg`,
          ),
          false,
        );
      }
      callback(null, true);
    },
    limits: {
      fileSize: MAX_FILE_SIZE,
    },
  };
}
