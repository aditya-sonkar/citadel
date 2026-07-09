import { Router, Request, Response } from 'express';
import usersRouter, { userIamRouter } from '../modules/users/user.routes';
import { apiLimiter, authLimiter } from '../core/middlewares/rateLimiter.middleware';

const router = Router();

import authRouter from '../modules/auth/auth.routes';
import resourcesRouter from '../modules/resources/resources.routes';
import policyRouter from '../modules/policies/policy.routes';
import groupsRouter from '../modules/groups/group.routes';
import auditRouter from '../modules/audit/audit.routes';

// Inline health check to avoid importing from empty health.routes
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString()
    }
  });
});

import evaluateRouter from '../modules/evaluate/evaluate.routes';

// Import and mount module routers here as they are implemented
router.use('/api/users', apiLimiter, usersRouter);
router.use('/api/auth', authLimiter, authRouter);
router.use('/api', apiLimiter, resourcesRouter);
router.use('/api/iam/policies', apiLimiter, policyRouter);
router.use('/api/iam/groups', apiLimiter, groupsRouter);
router.use('/api/iam/users', apiLimiter, userIamRouter);
router.use('/api/iam/audit-logs', apiLimiter, auditRouter);
router.use('/api/iam/evaluate', apiLimiter, evaluateRouter);

export default router;

