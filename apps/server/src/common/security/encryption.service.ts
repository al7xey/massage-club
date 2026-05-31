import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const ENCRYPTED_PREFIX = 'enc:v1:';
const IV_BYTES = 12;
const AUTH_TAG_BYTES = 16;

@Injectable()
export class EncryptionService {
  private readonly key: Buffer;

  constructor(configService: ConfigService) {
    this.key = resolveEncryptionKey(configService.get<string>('APP_ENCRYPTION_KEY'));
  }

  encrypt(plainText: string): string {
    if (!plainText || plainText.startsWith(ENCRYPTED_PREFIX)) {
      return plainText;
    }

    const iv = randomBytes(IV_BYTES);
    const cipher = createCipheriv(ALGORITHM, this.key, iv);
    const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return `${ENCRYPTED_PREFIX}${Buffer.concat([iv, authTag, encrypted]).toString('base64')}`;
  }

  decrypt(value: string): string {
    if (!value || !value.startsWith(ENCRYPTED_PREFIX)) {
      return value;
    }

    const payload = Buffer.from(value.slice(ENCRYPTED_PREFIX.length), 'base64');
    const iv = payload.subarray(0, IV_BYTES);
    const authTag = payload.subarray(IV_BYTES, IV_BYTES + AUTH_TAG_BYTES);
    const encrypted = payload.subarray(IV_BYTES + AUTH_TAG_BYTES);
    const decipher = createDecipheriv(ALGORITHM, this.key, iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
  }
}

function resolveEncryptionKey(configValue?: string): Buffer {
  const value = configValue?.trim();

  if (!value) {
    return Buffer.from('development_only_encryption_key!');
  }

  if (/^[a-f0-9]{64}$/i.test(value)) {
    return Buffer.from(value, 'hex');
  }

  const base64Value = Buffer.from(value, 'base64');
  if (base64Value.length === 32) {
    return base64Value;
  }

  const utf8Value = Buffer.from(value, 'utf8');
  if (utf8Value.length >= 32) {
    return utf8Value.subarray(0, 32);
  }

  throw new Error('APP_ENCRYPTION_KEY must be 32 bytes as base64, 64 hex characters, or at least 32 utf8 bytes');
}
