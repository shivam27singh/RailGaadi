import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('[API ERROR]', err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'An unexpected internal error occurred.';
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      retryable: statusCode >= 500
    }
  });
}
