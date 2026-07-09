import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../../core/middlewares/auth.middleware';
import { authorize } from '../../core/middlewares/authorize.middleware';
import * as evaluateController from './evaluate.controller';
import { IAM_ACTIONS } from '../../iam/iam.constants';

const router = Router();

// Custom evaluation authorization middleware to permit self-evaluation
const authorizeEvaluation = (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.body;
  const callerUserId = req.user?.userId;

  // Rule: If users are evaluating their own permissions, bypass EVALUATE_POLICY check
  if (userId && callerUserId && userId === callerUserId) {
    return next();
  }

  // Otherwise, delegate to standard authorize middleware
  return authorize(IAM_ACTIONS.EVALUATE_POLICY)(req, res, next);
};

// Evaluate policy access
router.post('/', authMiddleware, authorizeEvaluation, evaluateController.evaluateAccess);

// Batch evaluate policy access
router.post('/batch', authMiddleware, authorizeEvaluation, evaluateController.evaluateBatch);

export default router;
