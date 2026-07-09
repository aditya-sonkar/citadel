"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.detachPolicy = exports.attachPolicy = exports.removeMember = exports.addMember = exports.deleteGroup = exports.updateGroup = exports.listGroups = exports.getGroupById = exports.createGroup = void 0;
const groupRepository = __importStar(require("./group.repository"));
const prisma_1 = require("../../core/database/prisma");
const ApiError_1 = require("../../shared/ApiError");
const constants_1 = require("../../core/utils/constants");
const delegation_1 = require("../../iam/delegation");
const client_1 = require("@prisma/client");
const auditService = __importStar(require("../audit/audit.service"));
const createGroup = async (data, callerUserId) => {
    const trimmedName = data.name.trim();
    // 1. Case-insensitive uniqueness check
    const existing = await groupRepository.findGroupByNameCaseInsensitive(trimmedName);
    if (existing) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.CONFLICT, `Group with name "${trimmedName}" already exists`);
    }
    const group = await groupRepository.createGroup(data);
    // Success Audit Log
    auditService.log({
        userId: callerUserId,
        action: 'iam:CreateGroup',
        targetResource: group.name,
        targetType: 'group',
        targetId: group.id,
        effect: client_1.AuditEffect.Allow,
        decision: client_1.AuditDecision.ALLOW_MATCH,
        metadata: { name: group.name },
    });
    return group;
};
exports.createGroup = createGroup;
const getGroupById = async (id) => {
    const group = await groupRepository.findGroupById(id);
    if (!group) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, 'Group not found');
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
            name: p.policy.name,
            type: p.policy.type,
            attachedAt: p.attachedAt,
        })),
    };
};
exports.getGroupById = getGroupById;
const listGroups = async (options) => {
    const { items, total } = await groupRepository.listGroups(options);
    // Format items to list counts directly per row
    const formattedItems = items.map((g) => {
        const { _count, ...rest } = g;
        return {
            ...rest,
            memberCount: _count?.memberships || 0,
            attachedPolicyCount: _count?.policies || 0,
        };
    });
    return { items: formattedItems, total };
};
exports.listGroups = listGroups;
const updateGroup = async (id, data, callerUserId) => {
    const group = await groupRepository.findGroupById(id);
    if (!group) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, 'Group not found');
    }
    if (data.name) {
        const trimmedName = data.name.trim();
        const existing = await groupRepository.findGroupByNameCaseInsensitive(trimmedName);
        if (existing && existing.id !== id) {
            throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.CONFLICT, `Group with name "${trimmedName}" already exists`);
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
        effect: client_1.AuditEffect.Allow,
        decision: client_1.AuditDecision.ALLOW_MATCH,
        metadata: { payload: data },
    });
    return updatedGroup;
};
exports.updateGroup = updateGroup;
const deleteGroup = async (id, callerUserId) => {
    const group = await groupRepository.findGroupById(id);
    if (!group) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, 'Group not found');
    }
    const deletedGroup = await groupRepository.deleteGroupWithCleanup(id);
    // Success Audit Log
    auditService.log({
        userId: callerUserId,
        action: 'iam:DeleteGroup',
        targetResource: deletedGroup.name,
        targetType: 'group',
        targetId: deletedGroup.id,
        effect: client_1.AuditEffect.Allow,
        decision: client_1.AuditDecision.ALLOW_MATCH,
    });
    return deletedGroup;
};
exports.deleteGroup = deleteGroup;
const addMember = async (groupId, userId, callerUserId) => {
    // 1. Verify group exists
    const group = await groupRepository.findGroupById(groupId);
    if (!group) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, 'Group not found');
    }
    // 2. Verify user exists
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, 'User not found');
    }
    // 3. Prevent duplicate memberships
    const exists = await groupRepository.checkMembershipExists(groupId, userId);
    if (exists) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.CONFLICT, 'User is already a member of this group');
    }
    const membership = await groupRepository.addMemberToGroup(groupId, userId);
    // Success Audit Log
    auditService.log({
        userId: callerUserId,
        action: 'iam:AddUserToGroup',
        targetResource: group.name,
        targetType: 'user',
        targetId: userId,
        effect: client_1.AuditEffect.Allow,
        decision: client_1.AuditDecision.ALLOW_MATCH,
        metadata: { groupId, userId },
    });
    return membership;
};
exports.addMember = addMember;
const removeMember = async (groupId, userId, callerUserId) => {
    // 1. Verify group exists
    const group = await groupRepository.findGroupById(groupId);
    if (!group) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, 'Group not found');
    }
    // 2. Verify membership exists
    const exists = await groupRepository.checkMembershipExists(groupId, userId);
    if (!exists) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, 'User is not a member of this group');
    }
    await groupRepository.removeMemberFromGroup(groupId, userId);
    // Success Audit Log
    auditService.log({
        userId: callerUserId,
        action: 'iam:RemoveUserFromGroup',
        targetResource: group.name,
        targetType: 'user',
        targetId: userId,
        effect: client_1.AuditEffect.Allow,
        decision: client_1.AuditDecision.ALLOW_MATCH,
        metadata: { groupId, userId },
    });
};
exports.removeMember = removeMember;
const attachPolicy = async (groupId, policyId, callerUserId) => {
    // 1. Verify group exists
    const group = await groupRepository.findGroupById(groupId);
    if (!group) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, 'Group not found');
    }
    // 2. Verify policy exists and validate its structure
    const policy = await prisma_1.prisma.policy.findUnique({
        where: { id: policyId },
    });
    if (!policy) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, 'Policy not found');
    }
    // 3. Constraint: Only MANAGED policies can be attached to groups
    if (policy.type !== client_1.PolicyType.MANAGED) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.BAD_REQUEST, 'Only MANAGED policies can be attached to groups');
    }
    // 4. Validate policy document structure
    const doc = policy.statements;
    if (!doc || !doc.statements || !Array.isArray(doc.statements)) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.BAD_REQUEST, 'Malformed policy document');
    }
    // 5. Prevent duplicate policy attachments
    const exists = await groupRepository.checkPolicyAttachmentExists(groupId, policyId);
    if (exists) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.CONFLICT, 'Policy is already attached to this group');
    }
    // 6. Delegation Bypass Prevention: verify caller owns permissions being attached
    try {
        await (0, delegation_1.verifyDelegation)(callerUserId, doc.statements);
    }
    catch (err) {
        auditService.log({
            userId: callerUserId,
            action: 'iam:AttachGroupPolicy',
            targetResource: group.name,
            targetType: 'group',
            targetId: groupId,
            effect: client_1.AuditEffect.Deny,
            decision: client_1.AuditDecision.DELEGATION_DENY,
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
        effect: client_1.AuditEffect.Allow,
        decision: client_1.AuditDecision.ALLOW_MATCH,
        metadata: { groupId, policyId },
    });
    return attachment;
};
exports.attachPolicy = attachPolicy;
const detachPolicy = async (groupId, policyId, callerUserId) => {
    // 1. Verify group exists
    const group = await groupRepository.findGroupById(groupId);
    if (!group) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, 'Group not found');
    }
    // 2. Verify attachment exists
    const exists = await groupRepository.checkPolicyAttachmentExists(groupId, policyId);
    if (!exists) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, 'Policy is not attached to this group');
    }
    // Fetch policy to get the name for the audit log
    const policy = await prisma_1.prisma.policy.findUnique({ where: { id: policyId } });
    const policyName = policy ? policy.name : policyId;
    await groupRepository.detachPolicyFromGroup(groupId, policyId);
    // Success Audit Log
    auditService.log({
        userId: callerUserId,
        action: 'iam:DetachGroupPolicy',
        targetResource: `${group.name} ↔ ${policyName}`,
        targetType: 'policy',
        targetId: policyId,
        effect: client_1.AuditEffect.Allow,
        decision: client_1.AuditDecision.ALLOW_MATCH,
        metadata: { groupId, policyId },
    });
};
exports.detachPolicy = detachPolicy;
