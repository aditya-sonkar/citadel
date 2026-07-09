import * as policyRepository from './policy.repository';
import * as userRepository from '../users/user.repository';
import { ApiError } from '../../shared/ApiError';
import { HTTP_STATUS } from '../../core/utils/constants';
import { verifyDelegation } from '../../iam/delegation';
import * as auditService from '../audit/audit.service';
import { AuditEffect, AuditDecision, PolicyType } from '@prisma/client';
import { prisma } from '../../core/database/prisma';


export const createPolicy = async (data: policyRepository.CreatePolicyInput, callerUserId: string) => {
  const trimmedName = data.name.trim();

  // 1. Case-insensitive uniqueness check
  const existing = await policyRepository.findPolicyByNameCaseInsensitive(trimmedName);
  if (existing) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      `Policy with name "${trimmedName}" already exists`
    );
  }

  // Delegation Bypass Prevention check on statements being created
  if (data.statements && Array.isArray(data.statements.statements)) {
    try {
      await verifyDelegation(callerUserId, data.statements.statements);
    } catch (err) {
      auditService.log({
        userId: callerUserId,
        action: 'policies:Create',
        targetResource: trimmedName,
        targetType: 'policy',
        effect: AuditEffect.Deny,
        decision: AuditDecision.DELEGATION_DENY,
        metadata: { error: err instanceof Error ? err.message : String(err), payload: data },
      });
      throw err;
    }
  }

  const policy = await prisma.$transaction(async (tx) => {
    const p = await tx.policy.create({
      data: {
        name: trimmedName,
        description: data.description,
        type: data.type,
        statements: data.statements,
      },
    });

    if (data.type === 'INLINE') {
      if (data.userId) {
        await tx.userPolicyAttachment.create({
          data: {
            userId: data.userId,
            policyId: p.id,
          },
        });
      } else if (data.groupId) {
        await tx.groupPolicyAttachment.create({
          data: {
            groupId: data.groupId,
            policyId: p.id,
          },
        });
      }
    }

    return p;
  });

  // Success audit log
  auditService.log({
    userId: callerUserId,
    action: 'policies:Create',
    targetResource: policy.name,
    targetType: 'policy',
    targetId: policy.id,
    effect: AuditEffect.Allow,
    decision: AuditDecision.ALLOW_MATCH,
    metadata: { policyId: policy.id, type: policy.type, userId: data.userId, groupId: data.groupId },
  });

  return policy;
};

export const getPolicyById = async (id: string) => {
  const policy = await policyRepository.findPolicyByIdWithCounts(id);
  if (!policy) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Policy not found');
  }

  // Map counts directly to response fields for frontend usability
  const { _count, ...rest } = policy as any;
  return {
    ...rest,
    userAttachments: _count?.userAttachments || 0,
    groupAttachments: _count?.groupAttachments || 0,
  };
};

export const listPolicies = async (options: policyRepository.ListPoliciesOptions) => {
  return policyRepository.listPolicies(options);
};

export const updatePolicy = async (id: string, data: policyRepository.UpdatePolicyInput, callerUserId: string) => {
  const policy = await policyRepository.findPolicyById(id);
  if (!policy) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Policy not found');
  }


  if (data.name) {
    const trimmedName = data.name.trim();
    // Verify name uniqueness across other policies
    const existing = await policyRepository.findPolicyByNameCaseInsensitive(trimmedName);
    if (existing && existing.id !== id) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        `Policy with name "${trimmedName}" already exists`
      );
    }
  }

  // Delegation Bypass Prevention check on statements being updated
  if (data.statements && Array.isArray(data.statements.statements)) {
    try {
      await verifyDelegation(callerUserId, data.statements.statements);
    } catch (err) {
      auditService.log({
        userId: callerUserId,
        action: 'policies:Update',
        targetResource: policy.name,
        targetType: 'policy',
        targetId: id,
        effect: AuditEffect.Deny,
        decision: AuditDecision.DELEGATION_DENY,
        metadata: { error: err instanceof Error ? err.message : String(err), payload: data },
      });
      throw err;
    }
  }

  const updatedPolicy = await policyRepository.updatePolicy(id, data);

  // Success audit log
  auditService.log({
    userId: callerUserId,
    action: 'policies:Update',
    targetResource: updatedPolicy.name,
    targetType: 'policy',
    targetId: updatedPolicy.id,
    effect: AuditEffect.Allow,
    decision: AuditDecision.ALLOW_MATCH,
    metadata: { policyId: updatedPolicy.id, payload: data },
  });

  return updatedPolicy;
};

export const deletePolicy = async (id: string, callerUserId: string) => {
  const policy = await policyRepository.findPolicyByIdWithCounts(id);
  if (!policy) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Policy not found');
  }


  // 2. Check attachments for MANAGED policies
  if (policy.type === 'MANAGED') {
    const isAttached = (policy._count.userAttachments > 0 || policy._count.groupAttachments > 0);
    
    if (isAttached) {
      // Allow root user to bypass
      const caller = await userRepository.findById(callerUserId);
      if (!caller || !caller.isRoot) {
        const attachments = await policyRepository.getPolicyAttachments(id);
        const userList = attachments.users.length > 0 ? `Users: [${attachments.users.join(', ')}]` : '';
        const groupList = attachments.groups.length > 0 ? `Groups: [${attachments.groups.join(', ')}]` : '';
        const joinedList = [userList, groupList].filter(Boolean).join(', ');
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          `Cannot delete policy. It is currently attached to: ${joinedList}. Detach it first.`
        );
      }
    }
  }

  const deletedPolicy = await policyRepository.deletePolicy(id);

  // Success audit log
  auditService.log({
    userId: callerUserId,
    action: 'policies:Delete',
    targetResource: deletedPolicy.name,
    targetType: 'policy',
    targetId: deletedPolicy.id,
    effect: AuditEffect.Allow,
    decision: AuditDecision.ALLOW_MATCH,
    metadata: { policyId: deletedPolicy.id },
  });

  return deletedPolicy;
};
