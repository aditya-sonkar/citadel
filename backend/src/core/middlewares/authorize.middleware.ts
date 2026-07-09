import { Request, Response, NextFunction } from 'express';
import { permissionEngine } from '../../iam/permission-engine';
import { ApiError } from '../../shared/ApiError';
import { HTTP_STATUS } from '../utils/constants';
import * as auditService from '../../modules/audit/audit.service';
import { AuditEffect, AuditDecision } from '@prisma/client';

export const authorize = (action: string, resource: string = '*') =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Guard: req.user must be set by authMiddleware first
      if (!req.user) {
        return next(
          new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid or expired access token')
        );
      }

      const result = await permissionEngine.hasPermission(
        req.user.userId,
        action,
        resource
      );

      // Log the authorization decision asynchronously (non-blocking)
      auditService.log({
        userId: req.user.userId,
        userEmail: req.user.email,
        action,
        targetResource: resource,
        effect: result.allowed ? AuditEffect.Allow : AuditEffect.Deny,
        decision: result.reason as AuditDecision,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'] as string | undefined,
      });

      if (result.allowed) {
        return next();
      }

      return next(
        new ApiError(
          HTTP_STATUS.FORBIDDEN,
          `Insufficient permissions for ${action}`
        )
      );
    } catch (error) {
      next(error);
    }
  };
