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
exports.evaluateBatch = exports.evaluateAccess = void 0;
const asyncHandler_1 = require("../../core/utils/asyncHandler");
const ApiResponse_1 = require("../../shared/ApiResponse");
const constants_1 = require("../../core/utils/constants");
const permission_engine_1 = require("../../iam/permission-engine");
const auditService = __importStar(require("../audit/audit.service"));
const client_1 = require("@prisma/client");
exports.evaluateAccess = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { action, resource, userId } = req.body;
    const callerUserId = req.user.userId;
    if (!action || !resource || !userId) {
        return res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json(new ApiResponse_1.ApiResponse(false, 'Missing required fields: action, resource, userId', null));
    }
    // Run the IAM engine
    const evaluation = await permission_engine_1.permissionEngine.hasPermission(userId, action, resource);
    // Construct evaluation path
    const evaluationPath = [];
    if (evaluation.reason === 'ROOT_BYPASS') {
        evaluationPath.push('User is root - Bypass all evaluation');
    }
    else if (evaluation.reason === 'NO_MATCH') {
        evaluationPath.push('Check explicit deny (0 matched)');
        evaluationPath.push('Check explicit allow (0 matched)');
        evaluationPath.push('Default Deny');
    }
    else if (evaluation.reason === 'EXPLICIT_DENY') {
        evaluationPath.push('Check explicit deny');
        evaluationPath.push(`Deny matched in policy: ${evaluation.matchedPolicyNames?.[0]}`);
    }
    else if (evaluation.reason === 'ALLOW_MATCH') {
        evaluationPath.push('Check explicit deny (0 matched)');
        evaluationPath.push('Check explicit allow');
        evaluationPath.push(`Allow matched in policy: ${evaluation.matchedPolicyNames?.join(', ')}`);
        evaluationPath.push('Check permission boundary (passed or not set)');
    }
    else if (evaluation.reason === 'BOUNDARY_DENY') {
        evaluationPath.push('Check explicit deny (0 matched)');
        evaluationPath.push('Check explicit allow');
        evaluationPath.push(`Allow matched in policy: ${evaluation.matchedPolicyNames?.join(', ')}`);
        evaluationPath.push('Check permission boundary');
        evaluationPath.push('Boundary Deny (action not allowed by boundary)');
    }
    // Determine effect and decision for audit
    const effect = evaluation.allowed ? client_1.AuditEffect.Allow : client_1.AuditEffect.Deny;
    const decision = evaluation.reason;
    // Log to Audit table
    auditService.log({
        userId,
        action,
        targetResource: resource,
        effect,
        decision,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        metadata: {
            callerUserId,
            matchedPolicyIds: evaluation.matchedPolicyIds,
            matchedPolicyNames: evaluation.matchedPolicyNames,
        }
    });
    res.status(constants_1.HTTP_STATUS.OK).json(new ApiResponse_1.ApiResponse(true, 'Evaluation complete', {
        decision: evaluation.reason,
        matchedPolicy: evaluation.matchedPolicyNames?.[0],
        evaluationPath,
        reason: evaluation.reason === 'ALLOW_MATCH' ? 'Action explicitly allowed by attached policy.' :
            evaluation.reason === 'ROOT_BYPASS' ? 'Action allowed because user has root privileges.' :
                evaluation.reason === 'EXPLICIT_DENY' ? 'Action explicitly denied by an attached policy.' :
                    evaluation.reason === 'BOUNDARY_DENY' ? 'Action allowed by identity policy but denied by permission boundary.' :
                        'Action implicitly denied because no policy explicitly allows it.',
    }));
});
const authorization_repository_1 = require("../policies/authorization.repository");
exports.evaluateBatch = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { actions, resource, userId } = req.body;
    const callerUserId = req.user.userId;
    if (!actions || !Array.isArray(actions) || !resource || !userId) {
        return res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json(new ApiResponse_1.ApiResponse(false, 'Missing required fields: actions array, resource, userId', null));
    }
    // Pre-load user permissions ONCE for the entire batch
    const preloadedData = await (0, authorization_repository_1.getUserPermissions)(userId);
    if (!preloadedData) {
        return res.status(constants_1.HTTP_STATUS.NOT_FOUND).json(new ApiResponse_1.ApiResponse(false, 'User not found', null));
    }
    const results = {};
    for (const action of actions) {
        const evaluation = await permission_engine_1.permissionEngine.hasPermission(userId, action, resource, preloadedData);
        // We intentionally skip audit logging for batch evaluate as it's meant for UI read-only previews.
        const isAllowed = evaluation.reason === 'ALLOW_MATCH' || evaluation.reason === 'ROOT_BYPASS';
        let reasonText = 'Implicitly Denied';
        if (evaluation.reason === 'ROOT_BYPASS') {
            reasonText = 'Allowed (Root Bypass)';
        }
        else if (evaluation.reason === 'ALLOW_MATCH') {
            reasonText = `Allowed`;
        }
        else if (evaluation.reason === 'EXPLICIT_DENY') {
            reasonText = 'Explicitly Denied';
        }
        else if (evaluation.reason === 'BOUNDARY_DENY') {
            reasonText = 'Boundary Blocked';
        }
        results[action] = {
            allowed: isAllowed,
            reason: reasonText,
            source: evaluation.matchedPolicyNames?.[0] || undefined
        };
    }
    res.status(constants_1.HTTP_STATUS.OK).json(new ApiResponse_1.ApiResponse(true, 'Batch evaluation complete', results));
});
