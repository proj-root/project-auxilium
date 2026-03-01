import { validationResult } from 'express-validator';
import { APIError } from '@auxilium/types/errors';
import { catchAsync } from '@/lib/catch-async';
import { logger } from '@/lib/logger';
import { Request, Response, NextFunction } from 'express';

interface ErrorResponse {
  status: string;
  message: string;
  stack?: string;
}

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  logger.warning(`Route not found: ${req.method} ${req.path}`);
  // If user tries to access non-existing route
  next(new APIError(`Resource not found - ${req.originalUrl}`, 404));
};

// eslint-disable-next-line no-unused-vars
export const globalErrorHandler = (err: APIError, req: Request, res: Response, next: NextFunction) => {
  // Set default values
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Enhanced response
  let response: ErrorResponse = {
    status: err.status.toString(),
    message: err.statusCode != 500 ? err.message : 'Internal Server Error',
    stack: '',
  };

  // Show stack trace in dev only for easier debugging
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    err.statusCode = 400;
    err.status = 'fail';
    response.message = 'Invalid JSON body!';
  }

  // Log all errors (could be replaced with winston or an external logger)
  // console.error(`[${new Date().toISOString()}]`, err);

  if (err.status != 500) {
    logger.error(err.message);
    console.error(err);
  } else {
    logger.error('Server error', {
      message: err.message,
      stack: err.stack,
      path: req.path,
    });
  }

  // Send response
  res.status(err.statusCode).json(response);
};

export const validate = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstErr = errors.array()[0];
    logger.warning('[VALIDATOR] ' + firstErr?.msg);
    throw new APIError(firstErr?.msg, 400);
  }
  return next();
});
