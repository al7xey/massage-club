import type { NextFunction, Request, Response } from 'express';

export interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
  keyPrefix?: string;
}

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateLimitBucket>();

export function createRateLimitMiddleware(options: RateLimitOptions) {
  return (request: Request, response: Response, next: NextFunction) => {
    const now = Date.now();
    const key = `${options.keyPrefix ?? 'global'}:${request.ip}:${request.path}`;
    const current = buckets.get(key);
    const bucket =
      current && current.resetAt > now
        ? { count: current.count + 1, resetAt: current.resetAt }
        : { count: 1, resetAt: now + options.windowMs };

    buckets.set(key, bucket);
    response.setHeader('RateLimit-Limit', String(options.maxRequests));
    response.setHeader('RateLimit-Remaining', String(Math.max(options.maxRequests - bucket.count, 0)));
    response.setHeader('RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count > options.maxRequests) {
      response.setHeader('Retry-After', String(Math.ceil((bucket.resetAt - now) / 1000)));
      response.status(429).json({ message: 'Too many requests. Please try again later.' });
      return;
    }

    if (buckets.size > 10000) {
      cleanupExpiredBuckets(now);
    }

    next();
  };
}

function cleanupExpiredBuckets(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}
