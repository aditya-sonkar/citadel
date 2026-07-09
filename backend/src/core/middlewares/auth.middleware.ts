import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { ApiError } from '../../shared/ApiError';
import { HTTP_STATUS } from '../utils/constants';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid or expired access token'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      isRoot: decoded.isRoot,
    };
    next();
  } catch (error) {
    next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid or expired access token'));
  }
};
