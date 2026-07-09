"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateBoundary = void 0;
const evaluator_1 = require("./evaluator");
/**
 * Evaluates whether a given action + resource is permitted by the boundary policy.
 *
 * Boundary acts as a maximum permission cap:
 *   Effective Permission = (Group + User Policies) INTERSECT (Boundary Policy)
 *
 * Uses the same evaluator as standard policy evaluation, which means:
 *   - Explicit Deny inside boundary also wins immediately.
 *   - Only an explicit Allow in boundary permits the action.
 *
 * Returns EvaluationResult (not just boolean) so callers can
 * distinguish EXPLICIT_DENY from NO_MATCH in the boundary context.
 */
const evaluateBoundary = (boundaryPolicies, action, resource) => {
    const result = (0, evaluator_1.evaluatePolicies)(action, resource, boundaryPolicies);
    // Map boundary-level denials to BOUNDARY_DENY reason
    if (!result.allowed) {
        return {
            allowed: false,
            reason: 'BOUNDARY_DENY',
            matchedPolicyIds: result.matchedPolicyIds,
            matchedPolicyNames: result.matchedPolicyNames,
        };
    }
    return result;
};
exports.evaluateBoundary = evaluateBoundary;
