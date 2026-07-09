import { Router } from 'express';
import { authMiddleware } from '../../core/middlewares/auth.middleware';
import { authorize } from '../../core/middlewares/authorize.middleware';
import { validate } from '../../core/middlewares/validate.middleware';
import * as groupController from './group.controller';
import { IAM_ACTIONS } from '../../iam/iam.constants';
import {
  createGroupSchema,
  updateGroupSchema,
  idParamSchema,
  memberActionSchema,
  memberDeleteParamSchema,
  policyAttachmentSchema,
  policyDeleteParamSchema,
  listGroupsQuerySchema,
  putGroupPolicySchema,
  deleteGroupPolicySchema,
} from './group.validator';

const router = Router();

// 1. POST / -> Create group
router.post(
  '/',
  authMiddleware,
  authorize(IAM_ACTIONS.CREATE_GROUP),
  validate(createGroupSchema),
  groupController.createGroup
);

// 2. GET / -> List groups
router.get(
  '/',
  authMiddleware,
  authorize(IAM_ACTIONS.LIST_GROUPS),
  validate(listGroupsQuerySchema),
  groupController.listGroups
);

// 3. GET /:id -> Get group detail
router.get(
  '/:id',
  authMiddleware,
  authorize(IAM_ACTIONS.GET_GROUP),
  validate(idParamSchema),
  groupController.getGroup
);

// 4. PATCH /:id -> Update group details
router.patch(
  '/:id',
  authMiddleware,
  authorize(IAM_ACTIONS.UPDATE_GROUP),
  validate(updateGroupSchema),
  groupController.updateGroup
);

// 5. DELETE /:id -> Delete group
router.delete(
  '/:id',
  authMiddleware,
  authorize(IAM_ACTIONS.DELETE_GROUP),
  validate(idParamSchema),
  groupController.deleteGroup
);

// 6. POST /:id/members -> Add user to group
router.post(
  '/:id/members',
  authMiddleware,
  authorize(IAM_ACTIONS.ADD_USER_TO_GROUP),
  validate(memberActionSchema),
  groupController.addMember
);

// 7. DELETE /:id/members/:userId -> Remove user from group
router.delete(
  '/:id/members/:userId',
  authMiddleware,
  authorize(IAM_ACTIONS.REMOVE_USER_FROM_GROUP),
  validate(memberDeleteParamSchema),
  groupController.removeMember
);

// 8. POST /:id/policies -> Attach policy to group
router.post(
  '/:id/policies',
  authMiddleware,
  authorize(IAM_ACTIONS.ATTACH_GROUP_POLICY),
  validate(policyAttachmentSchema),
  groupController.attachPolicy
);

// 9. DELETE /:id/policies/:policyId -> Detach policy from group
router.delete(
  '/:id/policies/:policyId',
  authMiddleware,
  authorize(IAM_ACTIONS.DETACH_GROUP_POLICY),
  validate(policyDeleteParamSchema),
  groupController.detachPolicy
);

// 10. PUT /:id/inline-policies/:policyName -> Put group inline policy
router.put(
  '/:id/inline-policies/:policyName',
  authMiddleware,
  authorize(IAM_ACTIONS.PUT_GROUP_POLICY),
  validate(putGroupPolicySchema),
  groupController.putGroupPolicy
);

// 11. DELETE /:id/inline-policies/:policyName -> Delete group inline policy
router.delete(
  '/:id/inline-policies/:policyName',
  authMiddleware,
  authorize(IAM_ACTIONS.DELETE_GROUP_POLICY),
  validate(deleteGroupPolicySchema),
  groupController.deleteGroupPolicy
);

export default router;
