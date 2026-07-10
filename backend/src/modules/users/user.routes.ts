import { Router } from 'express';
import { validate } from '../../core/middlewares/validate.middleware';
import { authMiddleware } from '../../core/middlewares/auth.middleware';
import { authorize } from '../../core/middlewares/authorize.middleware';
import * as userController from './user.controller';
import { IAM_ACTIONS } from '../../iam/iam.constants';
import {
  updateProfileSchema,
  idParamSchema,
  policyAttachmentSchema,
  policyDeleteParamSchema,
  listUsersQuerySchema,
  putUserPolicySchema,
  deleteUserPolicySchema,
  changePasswordSchema,
} from './user.validator';

const router = Router();

// --- Standard User routes ---
router.get('/me', authMiddleware, userController.getProfile);
router.put('/me', authMiddleware, validate(updateProfileSchema), userController.updateProfile);
router.put('/me/password', authMiddleware, validate(changePasswordSchema), userController.changePassword);

export default router;

// --- User IAM administration routes ---
export const userIamRouter = Router();

// 0. GET /credential-report -> Get credential report
userIamRouter.get(
  '/credential-report',
  authMiddleware,
  authorize(IAM_ACTIONS.GET_CREDENTIAL_REPORT),
  userController.getCredentialReport
);

// 1. GET / -> List users
userIamRouter.get(
  '/',
  authMiddleware,
  authorize(IAM_ACTIONS.LIST_USERS),
  validate(listUsersQuerySchema),
  userController.listUsers
);

// 2. GET /:id -> Get user details
userIamRouter.get(
  '/:id',
  authMiddleware,
  authorize(IAM_ACTIONS.GET_USER),
  validate(idParamSchema),
  userController.getUser
);

// 3. POST /:id/policies -> Attach direct policy to user
userIamRouter.post(
  '/:id/policies',
  authMiddleware,
  authorize(IAM_ACTIONS.ATTACH_USER_POLICY),
  validate(policyAttachmentSchema),
  userController.attachPolicy
);

// 4. DELETE /:id/policies/:policyId -> Detach policy from user
userIamRouter.delete(
  '/:id/policies/:policyId',
  authMiddleware,
  authorize(IAM_ACTIONS.DETACH_USER_POLICY),
  validate(policyDeleteParamSchema),
  userController.detachPolicy
);

// 5. PUT /:id/boundary -> Put user Permissions Boundary
userIamRouter.put(
  '/:id/boundary',
  authMiddleware,
  authorize(IAM_ACTIONS.PUT_USER_BOUNDARY),
  validate(policyAttachmentSchema),
  userController.putBoundary
);

// 6. DELETE /:id/boundary -> Delete user Permissions Boundary
userIamRouter.delete(
  '/:id/boundary',
  authMiddleware,
  authorize(IAM_ACTIONS.DELETE_USER_BOUNDARY),
  validate(idParamSchema),
  userController.deleteBoundary
);

// 7. DELETE /:id -> Delete user
userIamRouter.delete(
  '/:id',
  authMiddleware,
  authorize(IAM_ACTIONS.DELETE_USER),
  validate(idParamSchema),
  userController.deleteUser
);

// 8. PUT /:id/inline-policies/:policyName -> Put user inline policy
userIamRouter.put(
  '/:id/inline-policies/:policyName',
  authMiddleware,
  authorize(IAM_ACTIONS.PUT_USER_POLICY),
  validate(putUserPolicySchema),
  userController.putUserPolicy
);

// 9. DELETE /:id/inline-policies/:policyName -> Delete user inline policy
userIamRouter.delete(
  '/:id/inline-policies/:policyName',
  authMiddleware,
  authorize(IAM_ACTIONS.DELETE_USER_POLICY),
  validate(deleteUserPolicySchema),
  userController.deleteUserPolicy
);