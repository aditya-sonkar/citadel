import * as groupRepository from './group.repository';
import { prisma } from '../../core/database/prisma';
import { ApiError } from '../../shared/ApiError';
import { HTTP_STATUS } from '../../core/utils/constants';
import { verifyDelegation } from '../../iam/delegation';
import { PolicyType, AuditEffect, AuditDecision } from '@prisma/client';
import * as auditService from '../audit/audit.service';
import { getFriendlyPolicyName } from '../users/user.service';

export const createGroup = async (data: groupRepository.CreateGroupInput, callerUserId: string) => {
  const trimmedName = data.name.trim();

  // 1. Case-insensitive uniqueness check
  const existing = await groupRepository.findGroupByNameCaseInsensitive(trimmedName);
  if (existing) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      `Group with name "${trimmedName}" already exists`
    );
  }

  const group = await groupRepository.createGroup(data);

  // Success Audit Log
  auditService.log({
    userId: callerUserId,
    action: 'iam:CreateGroup',
    targetResource: group.name,
    targetType: 'group',
    targetId: group.id,
    effect: AuditEffect.Allow,
    decision: AuditDecision.ALLOW_MATCH,
    metadata: { name: group.name },
  });

  return group;
};

export const getGroupById = async (id: string) => {
  const group = await groupRepository.findGroupById(id);
  if (!group) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Group not found');
  }

  // Format the nested response for cleaner UI consumption
  return {
    id: group.id,
    name: group.name,
    description: group.description,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
    members: group.memberships.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      addedAt: m.addedAt,
    })),
    policies: group.policies.map((p) => ({
      id: p.policy.id,
      name: getFriendlyPolicyName(p.policy.name, p.policy.type),
      type: p.policy.type,
      attachedAt: p.attachedAt,
    })),
  };
};

export const listGroups = async (options: groupRepository.ListGroupsOptions) => {
  const { items, total } = await groupRepository.listGroups(options);
  
  // Format items to list counts directly per row
  const formattedItems = items.map((g) => {
    const { _count, ...rest } = g as any;
    return {
      ...rest,
      memberCount: _count?.memberships || 0,
      attachedPolicyCount: _count?.policies || 0,
    };
  });

  return { items: formattedItems, total };
};

export const updateGroup = async (id: string, data: groupRepository.UpdateGroupInput, callerUserId: string) => {
  const group = await groupRepository.findGroupById(id);
  if (!group) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Group not found');
  }

  if (data.name) {
    const trimmedName = data.name.trim();
    const existing = await groupRepository.findGroupByNameCaseInsensitive(trimmedName);
    if (existing && existing.id !== id) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        `Group with name "${trimmedName}" already exists`
      );
    }
  }

  const updatedGroup = await groupRepository.updateGroup(id, data);

  // Success Audit Log
  auditService.log({
    userId: callerUserId,
    action: 'iam:UpdateGroup',
    targetResource: updatedGroup.name,
    targetType: 'group',
    targetId: updatedGroup.id,
    effect: AuditEffect.Allow,
    decision: AuditDecision.ALLOW_MATCH,
    metadata: { payload: data },
  });

  return updatedGroup;
};

export const deleteGroup = async (id: string, callerUserId: string) => {
  const group = await groupRepository.findGroupById(id);
  if (!group) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Group not found');
  }

  const deletedGroup = await groupRepository.deleteGroupWithCleanup(id);

  // Success Audit Log
  auditService.log({
    userId: callerUserId,
    action: 'iam:DeleteGroup',
    targetResource: deletedGroup.name,
    targetType: 'group',
    targetId: deletedGroup.id,
    effect: AuditEffect.Allow,
    decision: AuditDecision.ALLOW_MATCH,
  });

  return deletedGroup;
};

export const addMember = async (groupId: string, userId: string, callerUserId: string) => {
  // 1. Verify group exists
  const group = await groupRepository.findGroupById(groupId);
  if (!group) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Group not found');
  }

  // 2. Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
  }

  // 3. Prevent duplicate memberships
  const exists = await groupRepository.checkMembershipExists(groupId, userId);
  if (exists) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      'User is already a member of this group'
    );
  }

  const membership = await groupRepository.addMemberToGroup(groupId, userId);

  // Success Audit Log
  auditService.log({
    userId: callerUserId,
    action: 'iam:AddUserToGroup',
    targetResource: group.name,
    targetType: 'user',
    targetId: userId,
    effect: AuditEffect.Allow,
    decision: AuditDecision.ALLOW_MATCH,
    metadata: { groupId, userId },
  });

  return membership;
};

export const removeMember = async (groupId: string, userId: string, callerUserId: string) => {
  // 1. Verify group exists
  const group = await groupRepository.findGroupById(groupId);
  if (!group) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Group not found');
  }

  // 2. Verify membership exists
  const exists = await groupRepository.checkMembershipExists(groupId, userId);
  if (!exists) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      'User is not a member of this group'
    );
  }

  await groupRepository.removeMemberFromGroup(groupId, userId);

  // Success Audit Log
  auditService.log({
    userId: callerUserId,
    action: 'iam:RemoveUserFromGroup',
    targetResource: group.name,
    targetType: 'user',
    targetId: userId,
    effect: AuditEffect.Allow,
    decision: AuditDecision.ALLOW_MATCH,
    metadata: { groupId, userId },
  });
};

export const attachPolicy = async (groupId: string, policyId: string, callerUserId: string) => {
  // 1. Verify group exists
  const group = await groupRepository.findGroupById(groupId);
  if (!group) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Group not found');
  }

  // 2. Verify policy exists and validate its structure
  const policy = await prisma.policy.findUnique({
    where: { id: policyId },
  });
  if (!policy) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Policy not found');
  }

  // 3. Constraint: Only MANAGED policies can be attached to groups
  if (policy.type !== PolicyType.MANAGED) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'Only MANAGED policies can be attached to groups'
    );
  }

  // 4. Validate policy document structure
  const doc = policy.statements as any;
  if (!doc || !doc.statements || !Array.isArray(doc.statements)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Malformed policy document');
  }

  // 5. Prevent duplicate policy attachments
  const exists = await groupRepository.checkPolicyAttachmentExists(groupId, policyId);
  if (exists) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      'Policy is already attached to this group'
    );
  }

  // 6. Delegation Bypass Prevention: verify caller owns permissions being attached
  try {
    await verifyDelegation(callerUserId, doc.statements);
  } catch (err) {
    auditService.log({
      userId: callerUserId,
      action: 'iam:AttachGroupPolicy',
      targetResource: group.name,
      targetType: 'group',
      targetId: groupId,
      effect: AuditEffect.Deny,
      decision: AuditDecision.DELEGATION_DENY,
      metadata: { error: err instanceof Error ? err.message : String(err), policyId },
    });
    throw err;
  }

  const attachment = await groupRepository.attachPolicyToGroup(groupId, policyId);

  // Success Audit Log
  auditService.log({
    userId: callerUserId,
    action: 'iam:AttachGroupPolicy',
    targetResource: `${group.name} ↔ ${policy.name}`,
    targetType: 'policy',
    targetId: policyId,
    effect: AuditEffect.Allow,
    decision: AuditDecision.ALLOW_MATCH,
    metadata: { groupId, policyId },
  });

  return attachment;
};

export const detachPolicy = async (groupId: string, policyId: string, callerUserId: string) => {
  // 1. Verify group exists
  const group = await groupRepository.findGroupById(groupId);
  if (!group) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Group not found');
  }

  // 2. Verify attachment exists
  const exists = await groupRepository.checkPolicyAttachmentExists(groupId, policyId);
  if (!exists) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      'Policy is not attached to this group'
    );
  }

  // Fetch policy to get the name for the audit log
  const policy = await prisma.policy.findUnique({ where: { id: policyId } });
  const policyName = policy ? policy.name : policyId;

  await prisma.$transaction(async (tx) => {
    await tx.groupPolicyAttachment.delete({
      where: {
        groupId_policyId: { groupId, policyId },
      },
    });

    if (policy && policy.type === PolicyType.INLINE) {
      await tx.policy.delete({
        where: { id: policyId },
      });
    }
  });

  // Success Audit Log
  auditService.log({
    userId: callerUserId,
    action: 'iam:DetachGroupPolicy',
    targetResource: `${group.name} ↔ ${policyName}`,
    targetType: 'policy',
    targetId: policyId,
    effect: AuditEffect.Allow,
    decision: AuditDecision.ALLOW_MATCH,
    metadata: { groupId, policyId },
  });
};

export const putGroupPolicy = async (
  groupId: string,
  policyName: string,
  statements: any,
  callerUserId: string
) => {
  // 1. Verify group exists
  const group = await groupRepository.findGroupById(groupId);
  if (!group) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Group not found');
  }

  // 2. Delegation Bypass Prevention: verify caller owns permissions being attached
  try {
    await verifyDelegation(callerUserId, statements.statements);
  } catch (err) {
    auditService.log({
      userId: callerUserId,
      action: 'iam:PutGroupPolicy',
      targetResource: group.name,
      targetType: 'group',
      targetId: groupId,
      effect: AuditEffect.Deny,
      decision: AuditDecision.DELEGATION_DENY,
      metadata: { error: err instanceof Error ? err.message : String(err), policyName },
    });
    throw err;
  }

  // Use unique name constraint for database
  const dbPolicyName = `inline-group-${groupId}-${policyName}`;

  const result = await prisma.$transaction(async (tx) => {
    // Check if inline policy already exists for this group
    let policy = await tx.policy.findFirst({
      where: {
        name: dbPolicyName,
        type: 'INLINE',
      },
    });

    if (policy) {
      // Update existing inline policy
      policy = await tx.policy.update({
        where: { id: policy.id },
        data: { statements },
      });
    } else {
      // Create new policy
      policy = await tx.policy.create({
        data: {
          name: dbPolicyName,
          type: 'INLINE',
          statements,
          description: `Inline policy for group ${group.name}`,
        },
      });

      // Attach it
      await tx.groupPolicyAttachment.create({
        data: {
          groupId,
          policyId: policy.id,
        },
      });
    }

    return policy;
  });

  // Success Audit Log
  auditService.log({
    userId: callerUserId,
    action: 'iam:PutGroupPolicy',
    targetResource: `${group.name} ↔ ${policyName}`,
    targetType: 'policy',
    targetId: result.id,
    effect: AuditEffect.Allow,
    decision: AuditDecision.ALLOW_MATCH,
    metadata: { groupId, policyName },
  });

  return result;
};

export const deleteGroupPolicy = async (
  groupId: string,
  policyName: string,
  callerUserId: string
) => {
  // 1. Verify group exists
  const group = await groupRepository.findGroupById(groupId);
  if (!group) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Group not found');
  }

  const dbPolicyName = `inline-group-${groupId}-${policyName}`;

  // 2. Find inline policy
  const policy = await prisma.policy.findFirst({
    where: {
      name: dbPolicyName,
      type: 'INLINE',
    },
  });

  if (!policy) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Inline policy not found');
  }

  // 3. Detach and delete policy
  await prisma.$transaction(async (tx) => {
    await tx.groupPolicyAttachment.delete({
      where: {
        groupId_policyId: { groupId, policyId: policy.id },
      },
    });

    await tx.policy.delete({
      where: { id: policy.id },
    });
  });

  // Success Audit Log
  auditService.log({
    userId: callerUserId,
    action: 'iam:DeleteGroupPolicy',
    targetResource: `${group.name} ↔ ${policyName}`,
    targetType: 'policy',
    targetId: policy.id,
    effect: AuditEffect.Allow,
    decision: AuditDecision.ALLOW_MATCH,
    metadata: { groupId, policyName },
  });
};
