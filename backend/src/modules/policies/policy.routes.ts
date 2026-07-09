import { Router } from 'express';
import { authMiddleware } from '../../core/middlewares/auth.middleware';
import { authorize } from '../../core/middlewares/authorize.middleware';
import { validate } from '../../core/middlewares/validate.middleware';
import * as policyController from './policy.controller';
import { IAM_ACTIONS } from '../../iam/iam.constants';
import {
  createPolicySchema,
  updatePolicySchema,
  idParamSchema,
  listPoliciesQuerySchema,
} from './policy.validator';

const router = Router();

// 1. POST / -> Create policy
router.post(
  '/',
  authMiddleware,
  authorize(IAM_ACTIONS.CREATE_POLICY),
  validate(createPolicySchema),
  policyController.createPolicy
);

// 2. GET / -> List policies (with pagination, search, sorting)
router.get(
  '/',
  authMiddleware,
  authorize(IAM_ACTIONS.LIST_POLICIES),
  validate(listPoliciesQuerySchema),
  policyController.listPolicies
);

// 3. GET /:id -> Get policy details
router.get(
  '/:id',
  authMiddleware,
  authorize(IAM_ACTIONS.GET_POLICY),
  validate(idParamSchema),
  policyController.getPolicy
);

// 4. PUT /:id -> Update policy details
router.put(
  '/:id',
  authMiddleware,
  authorize(IAM_ACTIONS.UPDATE_POLICY),
  validate(updatePolicySchema),
  policyController.updatePolicy
);

// 5. DELETE /:id -> Delete policy
router.delete(
  '/:id',
  authMiddleware,
  authorize(IAM_ACTIONS.DELETE_POLICY),
  validate(idParamSchema),
  policyController.deletePolicy
);

export default router;
