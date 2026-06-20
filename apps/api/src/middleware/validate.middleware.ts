import { RequestHandler } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '../shared/errors/app-error';

type RequestPart = 'body' | 'params' | 'query';

declare global {
  namespace Express {
    interface Locals {
      validated: unknown;
    }
  }
}

export function validate(schema: ZodSchema, part: RequestPart = 'body'): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      const message = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
      next(new ValidationError(message));
      return;
    }
    // Express 5: req.query and req.params are read-only — store parsed data on res.locals
    res.locals.validated = result.data;
    next();
  };
}

export function getValidated<T>(res: { locals: Express.Locals }): T {
  return res.locals.validated as T;
}
