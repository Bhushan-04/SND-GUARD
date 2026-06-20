import { ErrorRequestHandler, RequestHandler } from 'express';
import { AppError, ErrorCode } from '../shared/errors/app-error';
import { ZodError } from 'zod';

export const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: ErrorCode.VALIDATION,
        message: err.errors.map((e) => e.message).join('; '),
      },
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    error: {
      code: ErrorCode.INTERNAL,
      message: 'Internal server error',
    },
  });
};

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({
    error: {
      code: ErrorCode.NOT_FOUND,
      message: 'Route not found',
    },
  });
};
