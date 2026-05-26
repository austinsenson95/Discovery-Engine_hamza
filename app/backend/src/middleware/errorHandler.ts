/**
 * ============================================================================
 * DISCOVERY ENGINE - Global Error Handler Middleware
 * ============================================================================
 * Catches all unhandled errors and returns a standardized error response.
 *
 * Usage: app.use(errorHandler) — must be registered AFTER all routes
 * ============================================================================
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Custom API Error class for structured error responses
 */
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global Express error handler
 */
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log the error with request context
  console.error(`[Error] ${req.method} ${req.path} — ${err.message}`);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  // Determine status code
  let statusCode = 500;
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
  }

  // Build response
  const response: {
    success: boolean;
    message: string;
    stack?: string;
  } = {
    success: false,
    message:
      process.env.NODE_ENV === 'production' && statusCode === 500
        ? 'Something went wrong. Please try again later.'
        : err.message,
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * 404 Not Found handler for unmatched routes
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
  });
};
