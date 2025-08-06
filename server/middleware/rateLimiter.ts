import type { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
}

export function createRateLimit(options: RateLimitOptions) {
  const { windowMs, max, message = 'Too many requests', skipSuccessfulRequests = false } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    
    if (!store[key] || store[key].resetTime <= now) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs
      };
    } else {
      store[key].count++;
    }

    if (store[key].count > max) {
      return res.status(429).json({ 
        message,
        retryAfter: Math.ceil((store[key].resetTime - now) / 1000)
      });
    }

    res.on('finish', () => {
      if (skipSuccessfulRequests && res.statusCode < 400) {
        store[key].count--;
      }
    });

    next();
  };
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const key in store) {
    if (store[key].resetTime <= now) {
      delete store[key];
    }
  }
}, 60000); // Clean every minute