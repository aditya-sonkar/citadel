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
exports.deletePolicy = exports.updatePolicy = exports.listPolicies = exports.getPolicyById = exports.createPolicy = void 0;
const policyRepository = __importStar(require("./policy.repository"));
const userRepository = __importStar(require("../users/user.repository"));
const ApiError_1 = require("../../shared/ApiError");
const constants_1 = require("../../core/utils/constants");
const delegation_1 = require("../../iam/delegation");
const auditService = __importStar(require("../audit/audit.service"));
const client_1 = require("@prisma/client");
const createPolicy = async (data, callerUserId) => {
    const trimmedName = data.name.trim();
    // 1. Case-insensitive uniqueness check
    const existing = await policyRepository.findPolicyByNameCaseInsensitive(trimmedName);
    if (existing) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.CONFLICT, `Policy with name "${trimmedName}" already exists`);
    }
    // Delegation Bypass Prevention check on statements being created
    if (data.statements && Array.isArray(data.statements.statements)) {
        try {
            await (0, delegation_1.verifyDelegation)(callerUserId, data.statements.statements);
        }
        catch (err) {
            auditService.log({
                userId: callerUserId,
                action: 'policies:Create',
                targetResource: trimmedName,
                targetType: 'policy',
                effect: client_1.AuditEffect.Deny,
                decision: client_1.AuditDecision.DELEGATION_DENY,
                metadata: { error: err instanceof Error ? err.message : String(err), payload: data },
            });
            throw err;
        }
    }
    const policy = await policyRepository.createPolicy(data);
    // Success audit log
    auditService.log({
        userId: callerUserId,
        action: 'policies:Create',
        targetResource: policy.name,
        targetType: 'policy',
        targetId: policy.id,
        effect: client_1.AuditEffect.Allow,
        decision: client_1.AuditDecision.ALLOW_MATCH,
        metadata: { policyId: policy.id, type: policy.type },
    });
    return policy;
};
exports.createPolicy = createPolicy;
const getPolicyById = async (id) => {
    const policy = await policyRepository.findPolicyByIdWithCounts(id);
    if (!policy) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, 'Policy not found');
    }
    // Map counts directly to response fields for frontend usability
    const { _count, ...rest } = policy;
    return {
        ...rest,
        userAttachments: _count?.userAttachments || 0,
        groupAttachments: _count?.groupAttachments || 0,
    };
};
exports.getPolicyById = getPolicyById;
const listPolicies = async (options) => {
    return policyRepository.listPolicies(options);
};
exports.listPolicies = listPolicies;
const updatePolicy = async (id, data, callerUserId) => {
    const policy = await policyRepository.findPolicyById(id);
    if (!policy) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, 'Policy not found');
    }
    if (data.name) {
        const trimmedName = data.name.trim();
        // Verify name uniqueness across other policies
        const existing = await policyRepository.findPolicyByNameCaseInsensitive(trimmedName);
        if (existing && existing.id !== id) {
            throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.CONFLICT, `Policy with name "${trimmedName}" already exists`);
        }
    }
    // Delegation Bypass Prevention check on statements being updated
    if (data.statements && Array.isArray(data.statements.statements)) {
        try {
            await (0, delegation_1.verifyDelegation)(callerUserId, data.statements.statements);
        }
        catch (err) {
            auditService.log({
                userId: callerUserId,
                action: 'policies:Update',
                targetResource: policy.name,
                targetType: 'policy',
                targetId: id,
                effect: client_1.AuditEffect.Deny,
                decision: client_1.AuditDecision.DELEGATION_DENY,
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
        effect: client_1.AuditEffect.Allow,
        decision: client_1.AuditDecision.ALLOW_MATCH,
        metadata: { policyId: updatedPolicy.id, payload: data },
    });
    return updatedPolicy;
};
exports.updatePolicy = updatePolicy;
const deletePolicy = async (id, callerUserId) => {
    const policy = await policyRepository.findPolicyByIdWithCounts(id);
    if (!policy) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, 'Policy not found');
    }
    // 2. Check attachments for MANAGED policies
    if (policy.type === 'MANAGED') {
        const isAttached = (policy._count.userAttachments > 0 || policy._count.groupAttachments > 0);
        if (isAttached) {
            // Allow root user to bypass
            const caller = await userRepository.findById(callerUserId);
            if (!caller || !caller.isRoot) {
                throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.BAD_REQUEST, `Cannot delete policy. It is currently attached to ${policy._count.userAttachments} user(s) and ${policy._count.groupAttachments} group(s). Detach it first.`);
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
        effect: client_1.AuditEffect.Allow,
        decision: client_1.AuditDecision.ALLOW_MATCH,
        metadata: { policyId: deletedPolicy.id },
    });
    return deletedPolicy;
};
exports.deletePolicy = deletePolicy;
