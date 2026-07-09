import { evaluatePolicies } from './evaluator';
import { AggregatedPolicy, EvaluationResult } from './iam.types';

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
export const evaluateBoundary = (
  boundaryPolicies: AggregatedPolicy[],
  action: string,
  resource: string
): EvaluationResult => {
  const result = evaluatePolicies(action, resource, boundaryPolicies);

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
