import { Router } from 'express';
import { authMiddleware } from '../../core/middlewares/auth.middleware';
import { authorize } from '../../core/middlewares/authorize.middleware';
import { validate } from '../../core/middlewares/validate.middleware';
import * as auditController from './audit.controller';
import { IAM_ACTIONS } from '../../iam/iam.constants';
import { idParamSchema, listLogsQuerySchema } from './audit.validator';

const router = Router();

// 1. GET / -> List audit logs
router.get(
  '/',
  authMiddleware,
  authorize(IAM_ACTIONS.LIST_AUDIT_LOGS),
  validate(listLogsQuerySchema),
  auditController.listLogs
);

// 2. GET /:id -> Get audit log detail
router.get(
  '/:id',
  authMiddleware,
  authorize(IAM_ACTIONS.GET_AUDIT_LOG),
  validate(idParamSchema),
  auditController.getLog
);

export default router;
