"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluatePolicies = void 0;
const matcher_1 = require("./matcher");
const logger_1 = require("../core/logger/logger");
/**
 * Evaluates a list of aggregated policies against an action and resource.
 *
 * Evaluation order (AWS IAM style):
 * 1. Explicit Deny always wins — checked first across all policies.
 * 2. Explicit Allow — if at least one matching Allow statement exists.
 * 3. Default Deny — if nothing matches.
 */
const evaluatePolicies = (action, resource, policies) => {
    const allowMatchedIds = [];
    const allowMatchedNames = [];
    for (const policy of policies) {
        let statements;
        // Safely parse policy statements — skip malformed policies
        try {
            statements = policy.statements;
            if (!Array.isArray(statements)) {
                throw new Error('statements is not an array');
            }
        }
        catch (err) {
            logger_1.logger.error({
                message: 'Malformed policy statements — skipping',
                policyId: policy.id,
                policyName: policy.name,
                error: err,
            });
            continue;
        }
        for (const statement of statements) {
            const actionMatches = (0, matcher_1.matchAction)(action, statement.Action);
            const resourceMatches = (0, matcher_1.matchResource)(resource, statement.Resource);
            if (!actionMatches || !resourceMatches)
                continue;
            // Explicit Deny wins immediately — no further evaluation needed
            if (statement.Effect === 'Deny') {
                return {
                    allowed: false,
                    reason: 'EXPLICIT_DENY',
                    matchedPolicyIds: [policy.id],
                    matchedPolicyNames: [policy.name],
                };
            }
            // Collect Allow matches — continue checking for potential Denies
            if (statement.Effect === 'Allow') {
                if (!allowMatchedIds.includes(policy.id)) {
                    allowMatchedIds.push(policy.id);
                    allowMatchedNames.push(policy.name);
                }
            }
        }
    }
    if (allowMatchedIds.length > 0) {
        return {
            allowed: true,
            reason: 'ALLOW_MATCH',
            matchedPolicyIds: allowMatchedIds,
            matchedPolicyNames: allowMatchedNames,
        };
    }
    return {
        allowed: false,
        reason: 'NO_MATCH',
    };
};
exports.evaluatePolicies = evaluatePolicies;
