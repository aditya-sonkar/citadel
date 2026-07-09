import * as userRepository from './user.repository';
import { prisma } from '../../core/database/prisma';
import { ApiError } from '../../shared/ApiError';
import { HTTP_STATUS } from '../../core/utils/constants';
import { verifyDelegation } from '../../iam/delegation';
import { evaluatePolicies } from '../../iam/evaluator';
import { PolicyType, AuditEffect, AuditDecision } from '@prisma/client';
import * as auditService from '../audit/audit.service';

// System-managed policy names (cannot be deleted by non-root users)
const SYSTEM_POLICIES = ['ReadOnlyAccess', 'ReportsFullAccess'];

const CRITICAL_ACTIONS = [
  'iam:PutUserPolicy',
  'iam:DeleteUserPolicy',
  'iam:AttachUserPolicy',
  'iam:DetachUserPolicy',
  'iam:PutUserBoundary',
  'iam:DeleteUserBoundary',
];

export const getFriendlyPolicyName = (dbName: string, type: string) => {
  if (type === 'INLINE') {
    if (dbName.startsWith('inline-user-')) {
      return dbName.substring(49); // "inline-user-" (12) + UUID (36) + "-" (1) = 49
    }
    if (dbName.startsWith('inline-group-')) {
      return dbName.substring(50); // "inline-group-" (13) + UUID (36) + "-" (1) = 50
    }
  }
  return dbName;
};

// --- Standard User profile operations ---

export const getUserProfile = async (userId: string) => {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
  }

  // Remove Password Hash for security
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

export const UpdateUserProfile = async (userId: string, data: { name?: string }) => {
  // First check if the user exists or not
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
  }

  // Execute update in the DB
  const updatedUser = await userRepository.updateUser(userId, data);

  // Remove Password Hash from the updated user and then return
  const { passwordHash, ...safeUser } = updatedUser;
  return safeUser;
};

export const deleteUser = async (userId: string) => {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
  }

  if (user.isRoot) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Cannot delete the root user');
  }

  await prisma.$transaction(async (tx) => {
    // 1. Identify all inline policies attached to this user
    const attachments = await tx.userPolicyAttachment.findMany({
      where: { userId },
      include: { policy: true },
    });

    const inlinePolicyIds = attachments
      .filter((a) => a.policy.type === 'INLINE')
      .map((a) => a.policyId);

    // 2. Delete the user (this cascades and deletes user_policy_attachments etc.)
    await tx.user.delete({ where: { id: userId } });

    // 3. Delete the orphaned inline policies from the Policy table
    if (inlinePolicyIds.length > 0) {
      await tx.policy.deleteMany({
        where: { id: { in: inlinePolicyIds } },
      });
    }
  });
};

// --- IAM Administration operations ---

export const listUsers = async (options: userRepository.ListUsersOptions) => {
  const { items, total } = await userRepository.listUsers(options);

  const formattedItems = items.map((u) => {
    const { _count, boundary, passwordHash, policies, ...rest } = u as any;

    let managedCount = 0;
    let inlineCount = 0;
    
    if (policies) {
      policies.forEach((p: any) => {
        if (p.policy.type === 'MANAGED') managedCount++;
        else if (p.policy.type === 'INLINE') inlineCount++;
      });
    }

    return {
      ...rest,
      managedPoliciesCount: managedCount,
      inlinePoliciesCount: inlineCount,
      groupCount: _count?.memberships || 0,
      hasBoundary: !!boundary,
    };
  });

  return { items: formattedItems, total };
};

export const getUserById = async (id: string) => {
  const user = await userRepository.findUserByIdWithDetails(id);
  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
  }

  const { passwordHash, ...safeUser } = user as any;
  return {
    ...safeUser,
    policyCount: safeUser.policies?.length || 0,
    groupCount: safeUser.memberships?.length || 0,
    hasBoundary: !!safeUser.boundary,
    policies: safeUser.policies.map((p: any) => ({
      id: p.policy.id,
      name: getFriendlyPolicyName(p.policy.name, p.policy.type),
      type: p.policy.type,
      attachedAt: p.attachedAt,
    })),
    groups: safeUser.memberships.map((m: any) => ({
      id: m.group.id,
      name: m.group.name,
      description: m.group.description,
      addedAt: m.addedAt,
      policies: m.group.policies.map((gp: any) => ({
        id: gp.policy.id,
        name: getFriendlyPolicyName(gp.policy.name, gp.policy.type),
        type: gp.policy.type,
        attachedAt: gp.attachedAt,
      })),
    })),
    boundary: safeUser.boundary
      ? {
          id: safeUser.boundary.policy.id,
          name: safeUser.boundary.policy.name,
          statements: safeUser.boundary.policy.statements,
          attachedAt: safeUser.boundary.setAt,
        }
      : null,
  };
};

export const attachPolicy = async (userId: string, policyId: string, callerUserId: string) => {
  // 1. Verify user exists
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
  }

  // 2. Verify policy exists and validate structure
  const policy = await prisma.policy.findUnique({
    where: { id: policyId },
  });
  if (!policy) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Policy not found');
  }

  // 3. Only MANAGED policies can be attached directly
  if (policy.type !== PolicyType.MANAGED) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'Only MANAGED policies can be attached to users'
    );
  }

  const doc = policy.statements as any;
  if (!doc || !doc.statements || !Array.isArray(doc.statements)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Malformed policy document');
  }

  // 4. Prevent duplicate attachments
  const exists = await userRepository.checkUserPolicyAttachmentExists(userId, policyId);
  if (exists) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      'Policy is already attached to this user'
    );
  }

  // 5. Delegation Bypass Prevention: verify caller has permissions
  try {
    await verifyDelegation(callerUserId, doc.statements);
  } catch (err) {
    auditService.log({
      userId: callerUserId,
      action: 'iam:AttachUserPolicy',
      targetResource: user.email,
      targetType: 'user',
      targetId: userId,
      effect: AuditEffect.Deny,
      decision: AuditDecision.DELEGATION_DENY,
      metadata: { error: err instanceof Error ? err.message : String(err), policyId },
    });
    throw err;
  }

  const attachment = await userRepository.attachPolicyToUser(userId, policyId);

  // Success Audit Log
  auditService.log({
    userId: callerUserId,
    action: 'iam:AttachUserPolicy',
    targetResource: `${user.email} ↔ ${policy.name}`,
    targetType: 'policy',
    targetId: policyId,
    effect: AuditEffect.Allow,
    decision: AuditDecision.ALLOW_MATCH,
    metadata: { userId, policyId },
  });

  return attachment;
};

export const detachPolicy = async (userId: string, policyId: string, callerUserId: string) => {
  // 1. Verify user exists
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
  }

  // 2. Verify policy exists
  const policy = await prisma.policy.findUnique({
    where: { id: policyId },
  });
  if (!policy) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Policy not found');
  }

  // 3. Prevent detaching protected system policies from Root user
  if (user.isRoot && SYSTEM_POLICIES.includes(policy.name)) {
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      'Protected policy cannot be detached from root user'
    );
  }

  // 4. Verify attachment exists
  const exists = await userRepository.checkUserPolicyAttachmentExists(userId, policyId);
  if (!exists) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      'Policy is not attached to this user'
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.userPolicyAttachment.delete({
      where: {
        userId_policyId: { userId, policyId },
      },
    });

    if (policy.type === PolicyType.INLINE) {
      await tx.policy.delete({
        where: { id: policyId },
      });
    }
  });

  // Success Audit Log
  auditService.log({
    userId: callerUserId,
    action: 'iam:DetachUserPolicy',
    targetResource: `${user.email} ↔ ${policy.name}`,
    targetType: 'policy',
    targetId: policyId,
    effect: AuditEffect.Allow,
    decision: AuditDecision.ALLOW_MATCH,
    metadata: { userId, policyId },
  });
};

export const putBoundary = async (userId: string, policyId: string, callerUserId: string) => {
  // 0. Root-only check
  const caller = await userRepository.findById(callerUserId);
  if (!caller || !caller.isRoot) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Only the root user can modify permissions boundaries');
  }

  // 1. Verify user exists
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
  }

  // 2. Verify policy exists and validate structure
  const policy = await prisma.policy.findUnique({
    where: { id: policyId },
  });
  if (!policy) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Policy not found');
  }

  // 3. Only MANAGED policies can be set as boundaries
  if (policy.type !== PolicyType.MANAGED) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'Only MANAGED policies can be set as Permissions Boundary'
    );
  }

  const doc = policy.statements as any;
  if (!doc || !doc.statements || !Array.isArray(doc.statements)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Malformed policy document');
  }

  // 4. Self-Lockout Protection: Scoped strictly to targetUserId === callerUserId
  if (userId === callerUserId) {
    const wrappedBoundaryPolicy = [
      {
        id: policy.id,
        name: policy.name,
        statements: doc.statements,
      },
    ];

    for (const action of CRITICAL_ACTIONS) {
      const evaluation = evaluatePolicies(action, '*', wrappedBoundaryPolicy);
      if (!evaluation.allowed) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          `Self-lockout protection: Permissions Boundary must allow critical IAM operation "${action}"`
        );
      }
    }
  }

  // 5. Delegation Bypass Prevention: verify caller has permissions
  try {
    await verifyDelegation(callerUserId, doc.statements);
  } catch (err) {
    auditService.log({
      userId: callerUserId,
      action: 'iam:PutUserPermissionsBoundary',
      targetResource: user.email,
      targetType: 'user',
      targetId: userId,
      effect: AuditEffect.Deny,
      decision: AuditDecision.DELEGATION_DENY,
      metadata: { error: err instanceof Error ? err.message : String(err), policyId },
    });
    throw err;
  }

  const boundary = await userRepository.upsertUserBoundary(userId, policyId);

  // Success Audit Log
  auditService.log({
    userId: callerUserId,
    action: 'iam:PutUserPermissionsBoundary',
    targetResource: user.email,
    targetType: 'policy',
    targetId: policyId,
    effect: AuditEffect.Allow,
    decision: AuditDecision.ALLOW_MATCH,
    metadata: { userId, policyId },
  });

  return boundary;
};

export const deleteBoundary = async (userId: string, callerUserId: string) => {
  // 0. Root-only check
  const caller = await userRepository.findById(callerUserId);
  if (!caller || !caller.isRoot) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Only the root user can modify permissions boundaries');
  }

  // 1. Verify user exists
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
  }

  // 2. Verify boundary exists
  const boundary = await prisma.userBoundary.findUnique({
    where: { userId },
    include: { policy: true }
  });
  if (!boundary) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Permissions Boundary not found for this user');
  }

  await userRepository.deleteUserBoundary(userId);

  // Success Audit Log
  auditService.log({
    userId: callerUserId,
    action: 'iam:DeleteUserPermissionsBoundary',
    targetResource: `${user.email} ↔ ${boundary.policy.name}`,
    targetType: 'policy',
    targetId: boundary.policyId,
    effect: AuditEffect.Allow,
    decision: AuditDecision.ALLOW_MATCH,
    metadata: { userId },
  });
};

export const getCredentialReport = async () => {
  const users = await prisma.user.findMany({
    select: {
      email: true,
      updatedAt: true,
      sessions: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { createdAt: true }
      }
    }
  });

  return users.map(user => {
    let lastActive = 'Never';
    if (user.sessions.length > 0) {
      lastActive = user.sessions[0].createdAt.toISOString();
    }

    return {
      email: user.email,
      mfaEnabled: false,
      passwordLastChanged: user.updatedAt.toISOString(),
      activeKeys: 0,
      lastActive
    };
  });
};

export const putUserPolicy = async (
  userId: string,
  policyName: string,
  statements: any,
  callerUserId: string
) => {
  // 1. Verify user exists
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
  }

  // 2. Delegation Bypass Prevention: verify caller owns permissions being attached
  try {
    await verifyDelegation(callerUserId, statements.statements);
  } catch (err) {
    auditService.log({
      userId: callerUserId,
      action: 'iam:PutUserPolicy',
      targetResource: user.email,
      targetType: 'user',
      targetId: userId,
      effect: AuditEffect.Deny,
      decision: AuditDecision.DELEGATION_DENY,
      metadata: { error: err instanceof Error ? err.message : String(err), policyName },
    });
    throw err;
  }

  // Use unique name constraint for database
  const dbPolicyName = `inline-user-${userId}-${policyName}`;

  const result = await prisma.$transaction(async (tx) => {
    // Check if inline policy already exists for this user
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
          description: `Inline policy for user ${user.email}`,
        },
      });

      // Attach it
      await tx.userPolicyAttachment.create({
        data: {
          userId,
          policyId: policy.id,
        },
      });
    }

    return policy;
  });

  // Success Audit Log
  auditService.log({
    userId: callerUserId,
    action: 'iam:PutUserPolicy',
    targetResource: `${user.email} ↔ ${policyName}`,
    targetType: 'policy',
    targetId: result.id,
    effect: AuditEffect.Allow,
    decision: AuditDecision.ALLOW_MATCH,
    metadata: { userId, policyName },
  });

  return result;
};

export const deleteUserPolicy = async (
  userId: string,
  policyName: string,
  callerUserId: string
) => {
  // 1. Verify user exists
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
  }

  const dbPolicyName = `inline-user-${userId}-${policyName}`;

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
    await tx.userPolicyAttachment.delete({
      where: {
        userId_policyId: { userId, policyId: policy.id },
      },
    });

    await tx.policy.delete({
      where: { id: policy.id },
    });
  });

  // Success Audit Log
  auditService.log({
    userId: callerUserId,
    action: 'iam:DeleteUserPolicy',
    targetResource: `${user.email} ↔ ${policyName}`,
    targetType: 'policy',
    targetId: policy.id,
    effect: AuditEffect.Allow,
    decision: AuditDecision.ALLOW_MATCH,
    metadata: { userId, policyName },
  });
};