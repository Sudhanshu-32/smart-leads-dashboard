import { Request, Response, NextFunction } from 'express';

// Centralized error handler: registered LAST in app.ts (after all routes).
// Any route that calls next(error) lands here.
// Why centralized? Without this, every controller needs its own try/catch
// with duplicated error formatting. Here we handle it once.

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean; // Distinguishes expected errors (400/404) from bugs (500)
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log 500 errors — these are bugs, not user mistakes
  if (statusCode === 500) {
    console.error('UNHANDLED ERROR:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Show stack trace only in development — never in production
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Helper to create typed errors without having to set statusCode manually everywhere
export const createError = (message: string, statusCode: number): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};
