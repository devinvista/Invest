import type { Request, Response, NextFunction } from 'express';
import { gzipSync, brotliCompressSync } from 'zlib';

interface CompressionOptions {
  threshold?: number;
  level?: number;
  filter?: (req: Request, res: Response) => boolean;
}

export function compression(options: CompressionOptions = {}) {
  const {
    threshold = 1024,
    level = 6,
    filter = () => true
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;
    const originalSend = res.send;

    res.json = function(obj: any) {
      if (!filter(req, res)) {
        return originalJson.call(this, obj);
      }

      const content = JSON.stringify(obj);
      if (content.length < threshold) {
        return originalJson.call(this, obj);
      }

      const acceptEncoding = req.headers['accept-encoding'] || '';
      
      if (acceptEncoding.includes('br')) {
        const compressed = brotliCompressSync(content);
        this.set('Content-Encoding', 'br');
        this.set('Content-Type', 'application/json');
        this.set('Content-Length', compressed.length.toString());
        return this.end(compressed);
      } else if (acceptEncoding.includes('gzip')) {
        const compressed = gzipSync(content);
        this.set('Content-Encoding', 'gzip');
        this.set('Content-Type', 'application/json');
        this.set('Content-Length', compressed.length.toString());
        return this.end(compressed);
      }

      return originalJson.call(this, obj);
    };

    res.send = function(body: any) {
      if (!filter(req, res) || typeof body !== 'string' || body.length < threshold) {
        return originalSend.call(this, body);
      }

      const acceptEncoding = req.headers['accept-encoding'] || '';
      
      if (acceptEncoding.includes('br')) {
        const compressed = brotliCompressSync(body);
        this.set('Content-Encoding', 'br');
        this.set('Content-Length', compressed.length.toString());
        return this.end(compressed);
      } else if (acceptEncoding.includes('gzip')) {
        const compressed = gzipSync(body);
        this.set('Content-Encoding', 'gzip');
        this.set('Content-Length', compressed.length.toString());
        return this.end(compressed);
      }

      return originalSend.call(this, body);
    };

    next();
  };
}