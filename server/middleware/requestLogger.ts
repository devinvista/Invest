import type { Request, Response, NextFunction } from 'express';

export interface LoggedRequest extends Request {
  startTime: number;
}

export function requestLogger(req: LoggedRequest, res: Response, next: NextFunction) {
  req.startTime = Date.now();
  
  // Log request start
  const { method, url, ip } = req;
  console.log(`🌐 ${method} ${url} - ${ip}`);

  // Capture original end method
  const originalEnd = res.end;
  
  // Override end method to log response
  res.end = function(chunk?: any, encoding?: any, callback?: (() => void) | undefined) {
    const duration = Date.now() - req.startTime;
    const { statusCode } = res;
    
    // Choose emoji based on status code
    let emoji = '✅';
    if (statusCode >= 400 && statusCode < 500) {
      emoji = '⚠️';
    } else if (statusCode >= 500) {
      emoji = '❌';
    }
    
    console.log(`${emoji} ${method} ${url} ${statusCode} - ${duration}ms`);
    
    // Call original end method with proper return
    return originalEnd.call(this, chunk, encoding, callback);
  };

  next();
}

export function errorLogger(error: Error, req: Request, res: Response, next: NextFunction) {
  console.error(`❌ ERROR in ${req.method} ${req.url}:`, {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });
  
  next(error);
}