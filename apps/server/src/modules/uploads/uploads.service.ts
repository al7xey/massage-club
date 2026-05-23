import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { UploadedFile } from '../../common/types/uploaded-file.type';

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

@Injectable()
export class UploadsService {
  async saveUploadedFile(file: UploadedFile | undefined, folder: string) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (!allowedMimeTypes.has(file.mimetype)) {
      throw new BadRequestException('Only image uploads are allowed');
    }

    const extension = resolveExtension(file.originalname, file.mimetype);
    const safeFolder = folder.replace(/[^a-z0-9_-]/gi, '-').toLowerCase();
    const relativePath = `${safeFolder}/${randomUUID()}${extension}`;
    const absolutePath = path.resolve(process.cwd(), 'uploads', relativePath);
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, file.buffer);

    return {
      url: `/uploads/${relativePath.replace(/\\/g, '/')}`,
    };
  }
}

function resolveExtension(originalName: string, mimeType: string) {
  const fromName = path.extname(originalName).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(fromName)) {
    return fromName;
  }

  if (mimeType === 'image/png') return '.png';
  if (mimeType === 'image/webp') return '.webp';
  if (mimeType === 'image/gif') return '.gif';
  return '.jpg';
}
