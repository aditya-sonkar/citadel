"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissionEngine = exports.PermissionEngine = void 0;
const authorization_repository_1 = require("../modules/policies/authorization.repository");
const evaluator_1 = require("./evaluator");
const boundary_1 = require("./boundary");
const logger_1 = require("../core/logger/logger");
class PermissionEngine {
    /**
     * Evaluates whether a user has permission to perform an action on a resource.
     *
     * @param userId   - The user's UUID
     * @param action   - The action being requested (e.g. "reports:Read")
     * @param resource - The resource being accessed (defaults to "*")
     * @param preloadedData - Optional pre-loaded UserPermissionData for performance
     * @returns EvaluationResult with allowed flag, reason, and matched policy metadata
     */
    async hasPermission(userId, action, resource = '*', preloadedData) {
        // 1. Load user permissions from DB via repository
        const userData = preloadedData || await (0, authorization_repository_1.getUserPermissions)(userId);
        if (!userData) {
            logger_1.logger.warn({ userId, action, resource, decision: 'NO_MATCH', detail: 'User not found' });
            return { allowed: false, reason: 'NO_MATCH' };
        }
        // 2. Root bypass — skip all evaluation
        if (userData.isRoot) {
            logger_1.logger.info({ userId, action, resource, decision: 'ROOT_BYPASS' });
            return { allowed: true, reason: 'ROOT_BYPASS' };
        }
        // 3. Aggregate all policy statements (direct + group)
        const aggregated = this.aggregateStatements(userData.directPolicies, userData.groupPolicies);
        // 4. Evaluate combined policies
        const evaluationResult = (0, evaluator_1.evaluatePolicies)(action, resource, aggregated);
        // 5. If denied — log and return immediately
        if (!evaluationResult.allowed) {
            logger_1.logger.warn({ userId, action, resource, decision: evaluationResult.reason });
            return evaluationResult;
        }
        // 6. Evaluation allowed — now check boundary if one exists
        if (userData.boundaryPolicies.length > 0) {
            const boundaryResult = (0, boundary_1.evaluateBoundary)(userData.boundaryPolicies, action, resource);
            if (!boundaryResult.allowed) {
                logger_1.logger.warn({ userId, action, resource, decision: 'BOUNDARY_DENY' });
                return boundaryResult;
            }
        }
        // 7. Final allow
        logger_1.logger.info({
            userId,
            action,
            resource,
            decision: 'ALLOW_MATCH',
            matchedPolicyIds: evaluationResult.matchedPolicyIds,
            matchedPolicyNames: evaluationResult.matchedPolicyNames,
        });
        return evaluationResult;
    }
    /**
     * Aggregates policy statements from direct user policies and group memberships.
     * Deduplicates by policy ID to avoid double-counting when a user is
     * attached to a policy both directly and via a group.
     */
    aggregateStatements(directPolicies, groupPolicies) {
        const seen = new Set();
        const result = [];
        for (const policy of [...directPolicies, ...groupPolicies]) {
            if (!seen.has(policy.id)) {
                seen.add(policy.id);
                result.push(policy);
            }
        }
        return result;
    }
}
exports.PermissionEngine = PermissionEngine;
// Export singleton instance for use across the app
exports.permissionEngine = new PermissionEngine();
