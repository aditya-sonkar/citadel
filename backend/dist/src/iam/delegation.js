"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyDelegation = void 0;
const permission_engine_1 = require("./permission-engine");
const authorization_repository_1 = require("../modules/policies/authorization.repository");
const ApiError_1 = require("../shared/ApiError");
const constants_1 = require("../core/utils/constants");
/**
 * Validates that the caller has all the permissions that are being delegated.
 * Evaluates both caller's policies and Permissions Boundaries.
 * Throws a 403 Forbidden ApiError if any delegated permission is not possessed by the caller.
 * Bypasses checks if the caller is a Root user.
 */
const verifyDelegation = async (callerUserId, statements) => {
    // Pre-load caller permissions in a single database query to optimize calls
    const userData = await (0, authorization_repository_1.getUserPermissions)(callerUserId);
    if (!userData) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.FORBIDDEN, 'Caller profile not found');
    }
    // Root users bypass all delegation restrictions
    if (userData.isRoot) {
        return;
    }
    // Evaluate each allowed permission in the statements list
    for (const statement of statements) {
        if (statement.Effect !== 'Allow')
            continue;
        for (const action of statement.Action) {
            for (const resource of statement.Resource) {
                // Reuse permission engine's hasPermission logic (single source of truth)
                const evaluation = await permission_engine_1.permissionEngine.hasPermission(callerUserId, action, resource, userData);
                if (!evaluation.allowed) {
                    throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.FORBIDDEN, `Delegation bypass blocked: You do not possess the required permission "${action}" on resource "${resource}"`);
                }
            }
        }
    }
};
exports.verifyDelegation = verifyDelegation;
