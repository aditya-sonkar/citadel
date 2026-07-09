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
exports.deleteBoundary = exports.putBoundary = exports.detachPolicy = exports.attachPolicy = exports.getEffectiveAccess = exports.getResolvedStatements = exports.getUserById = exports.listUsers = void 0;
const userRepository = __importStar(require("./user.repository"));
const prisma_1 = require("../../core/database/prisma");
const ApiError_1 = require("../../shared/ApiError");
const constants_1 = require("../../core/utils/constants");
const delegation_1 = require("../../iam/delegation");
const effective_permissions_1 = require("../../iam/effective-permissions");
const evaluator_1 = require("../../iam/evaluator");
const client_1 = require("@prisma/client");
const SYSTEM_POLICIES = ['ReadOnlyAccess', 'ReportsFullAccess', 'PolicyAdministrator'];
const CRITICAL_ACTIONS = [
    'iam:ListUsers',
    'iam:GetUser',
    'iam:CreateGroup',
    'iam:UpdateGroup',
    'policies:Read',
    'policies:List',
    'iam:AttachUserPolicy',
    'iam:PutUserPermissionsBoundary',
];
const listUsers = async (options) => {
    const { items, total } = await userRepository.listUsers(options);
    const formattedItems = items.map((u) => {
        const { _count, boundary, passwordHash, ...rest } = u;
        return {
            ...rest,
            policyCount: _count?.policies || 0,
            groupCount: _count?.memberships || 0,
            hasBoundary: !!boundary,
        };
    });
    return { items: formattedItems, total };
};
exports.listUsers = listUsers;
const getUserById = async (id) => {
    const user = await userRepository.findUserByIdWithDetails(id);
    if (!user) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, 'User not found');
    }
    const { passwordHash, ...safeUser } = user;
    return {
        ...safeUser,
        policyCount: safeUser.policies?.length || 0,
        groupCount: safeUser.memberships?.length || 0,
        hasBoundary: !!safeUser.boundary,
        policies: safeUser.policies.map((p) => ({
            id: p.policy.id,
            name: p.policy.name,
            type: p.policy.type,
            attachedAt: p.attachedAt,
        })),
        groups: safeUser.memberships.map((m) => ({
            id: m.group.id,
            name: m.group.name,
            description: m.group.description,
            addedAt: m.addedAt,
        })),
        boundary: safeUser.boundary
            ? {
                id: safeUser.boundary.policy.id,
                name: safeUser.boundary.policy.name,
                statements: safeUser.boundary.policy.statements,
                attachedAt: safeUser.boundary.attachedAt,
            }
            : null,
    };
};
exports.getUserById = getUserById;
const getResolvedStatements = async (id) => {
    const user = await userRepository.findById(id);
    if (!user) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, 'User not found');
    }
    return (0, effective_permissions_1.buildResolvedStatements)(id);
};
exports.getResolvedStatements = getResolvedStatements;
const getEffectiveAccess = async (id) => {
    const user = await userRepository.findUserByIdWithDetails(id);
    if (!user) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, 'User not found');
    }
    return {
        isRoot: user.isRoot,
        groups: user.memberships.map((m) => m.group.name),
        policies: user.policies.map((p) => p.policy.name),
        boundary: user.boundary ? user.boundary.policy.name : null,
    };
};
exports.getEffectiveAccess = getEffectiveAccess;
const attachPolicy = async (userId, policyId, callerUserId) => {
    // 1. Verify user exists
    const user = await userRepository.findById(userId);
    if (!user) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, 'User not found');
    }
    // 2. Verify policy exists and validate structure
    const policy = await prisma_1.prisma.policy.findUnique({
        where: { id: policyId },
    });
    if (!policy) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, 'Policy not found');
    }
    // 3. Only MANAGED policies can be attached directly
    if (policy.type !== client_1.PolicyType.MANAGED) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.BAD_REQUEST, 'Only MANAGED policies can be attached to users');
    }
    const doc = policy.statements;
    if (!doc || !doc.statements || !Array.isArray(doc.statements)) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.BAD_REQUEST, 'Malformed policy document');
    }
    // 4. Prevent duplicate attachments
    const exists = await userRepository.checkUserPolicyAttachmentExists(userId, policyId);
    if (exists) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.CONFLICT, 'Policy is already attached to this user');
    }
    // 5. Delegation Bypass Prevention: verify caller has permissions
    await (0, delegation_1.verifyDelegation)(callerUserId, doc.statements);
    const attachment = await userRepository.attachPolicyToUser(userId, policyId);
    return attachment;
};
exports.attachPolicy = attachPolicy;
const detachPolicy = async (userId, policyId, callerUserId) => {
    // 1. Verify user exists
    const user = await userRepository.findById(userId);
    if (!user) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, 'User not found');
    }
    // 2. Verify policy exists
    const policy = await prisma_1.prisma.policy.findUnique({
        where: { id: policyId },
    });
    if (!policy) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, 'Policy not found');
    }
    // 3. Prevent detaching protected system policies from Root user
    if (user.isRoot && SYSTEM_POLICIES.includes(policy.name)) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.FORBIDDEN, 'Protected policy cannot be detached from root user');
    }
    // 4. Verify attachment exists
    const exists = await userRepository.checkUserPolicyAttachmentExists(userId, policyId);
    if (!exists) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, 'Policy is not attached to this user');
    }
    await userRepository.detachPolicyFromUser(userId, policyId);
};
exports.detachPolicy = detachPolicy;
const putBoundary = async (userId, policyId, callerUserId) => {
    // 1. Verify user exists
    const user = await userRepository.findById(userId);
    if (!user) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, 'User not found');
    }
    // 2. Verify policy exists and validate structure
    const policy = await prisma_1.prisma.policy.findUnique({
        where: { id: policyId },
    });
    if (!policy) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, 'Policy not found');
    }
    // 3. Only MANAGED policies can be set as boundaries
    if (policy.type !== client_1.PolicyType.MANAGED) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.BAD_REQUEST, 'Only MANAGED policies can be set as Permissions Boundary');
    }
    const doc = policy.statements;
    if (!doc || !doc.statements || !Array.isArray(doc.statements)) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.BAD_REQUEST, 'Malformed policy document');
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
            const evaluation = (0, evaluator_1.evaluatePolicies)(action, '*', wrappedBoundaryPolicy);
            if (!evaluation.allowed) {
                throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.BAD_REQUEST, `Self-lockout protection: Permissions Boundary must allow critical IAM operation "${action}"`);
            }
        }
    }
    // 5. Delegation Bypass Prevention: verify caller has permissions
    await (0, delegation_1.verifyDelegation)(callerUserId, doc.statements);
    const boundary = await userRepository.upsertUserBoundary(userId, policyId);
    return boundary;
};
exports.putBoundary = putBoundary;
const deleteBoundary = async (userId) => {
    // 1. Verify user exists
    const user = await userRepository.findById(userId);
    if (!user) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, 'User not found');
    }
    // 2. Verify boundary exists
    const exists = await userRepository.checkUserBoundaryExists(userId);
    if (!exists) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, 'Permissions Boundary not found for this user');
    }
    await userRepository.deleteUserBoundary(userId);
};
exports.deleteBoundary = deleteBoundary;
