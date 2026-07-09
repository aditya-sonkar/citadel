import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { ApiError } from '../../shared/ApiError';
import { env } from '../config/env';
import { logger } from '../logger/logger';
import { HTTP_STATUS } from '../utils/constants';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = err;

  // Map non-ApiError instances
  if (!(error instanceof ApiError)) {
    let statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    let message = error.message || 'Internal Server Error';

    if (error instanceof ZodError) {
      statusCode = HTTP_STATUS.BAD_REQUEST;
      message = 'Validation error';
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        statusCode = HTTP_STATUS.CONFLICT;
        message = 'Resource already exists';
      } else {
        statusCode = HTTP_STATUS.BAD_REQUEST;
        message = `Database operation failed`;
      }
    }

    error = new ApiError(statusCode, message, false, err.stack);
  }

  // Log error
  logger.error(
    `[${req.method}] ${req.originalUrl} - Status: ${error.statusCode} - Message: ${error.message}`
  );
  if (env.NODE_ENV === 'development' && !(err instanceof ZodError)) {
    console.error(err);
  }

  const response = {
    success: false,
    message: error.message,
    ...(err instanceof ZodError && { errors: err.issues }),
    ...(env.NODE_ENV === 'development' && { stack: error.stack }),
  };

  res.status(error.statusCode).json(response);
};
