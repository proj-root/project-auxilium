import morgan from 'morgan';
import { logger } from '@/lib/logger';
import type { NextFunction, Request, Response } from 'express';

const stream = {
  write: (message: string) => logger.http(message.trim()),
};

// Custom token to capture response time in ms
morgan.token('response-time-ms', (req: Request, res: Response) => {
  // @ts-ignore
  if (req.startTime) {
    // @ts-ignore
    const duration = Date.now() - req.startTime;
    return `${duration}ms`;
  }
  return `${res.getHeader('X-Response-Time') || 0}ms`;
});

// Custom format combining Morgan and Winston
const morganFormat = ':remote-addr :method :url :status :response-time-ms';

// Main Logger Middleware function
export const loggerMiddleware = morgan(morganFormat, { stream });

// Middleware to set response time header
export const getLoggerStartTime = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Wrap res.end to set the header just before the response is sent
  const originalEnd = res.end;
  // @ts-ignore
  res.end = function (...args) {
    const duration = Date.now() - start;
    res.setHeader('X-Response-Time', `${duration}`);
    // @ts-ignore
    originalEnd.apply(res, args);
  };

  next();
};
