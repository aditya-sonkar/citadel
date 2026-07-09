import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../utils/constants';

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: 'Route not found',
  });
};
