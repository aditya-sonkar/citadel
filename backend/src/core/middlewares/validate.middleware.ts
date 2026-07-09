import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';

export const validate = (schema: ZodTypeAny) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const parsed = (await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    })) as any;

    req.body = parsed.body;

    Object.defineProperty(req, 'query', {
      value: parsed.query,
      writable: true,
      configurable: true,
      enumerable: true,
    });

    Object.defineProperty(req, 'params', {
      value: parsed.params,
      writable: true,
      configurable: true,
      enumerable: true,
    });

    next();
  });
