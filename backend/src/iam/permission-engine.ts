import { getUserPermissions, UserPermissionData } from '../modules/policies/authorization.repository';
import { evaluatePolicies } from './evaluator';
import { evaluateBoundary } from './boundary';
import { AggregatedPolicy, EvaluationResult } from './iam.types';
import { logger } from '../core/logger/logger';

export class PermissionEngine {
  /**
   * Evaluates whether a user has permission to perform an action on a resource.
   *
   * @param userId   - The user's UUID
   * @param action   - The action being requested (e.g. "reports:Read")
   * @param resource - The resource being accessed (defaults to "*")
   * @param preloadedData - Optional pre-loaded UserPermissionData for performance
   * @returns EvaluationResult with allowed flag, reason, and matched policy metadata
   */
  async hasPermission(
    userId: string,
    action: string,
    resource: string = '*',
    preloadedData?: UserPermissionData
  ): Promise<EvaluationResult> {
    // 1. Load user permissions from DB via repository
    const userData = preloadedData || await getUserPermissions(userId);

    if (!userData) {
      logger.warn({ userId, action, resource, decision: 'NO_MATCH', detail: 'User not found' });
      return { allowed: false, reason: 'NO_MATCH' };
    }

    // 2. Root bypass — skip all evaluation
    if (userData.isRoot) {
      logger.info({ userId, action, resource, decision: 'ROOT_BYPASS' });
      return { allowed: true, reason: 'ROOT_BYPASS' };
    }

    // 3. Aggregate all policy statements (direct + group)
    const aggregated = this.aggregateStatements(
      userData.directPolicies,
      userData.groupPolicies
    );

    // 4. Evaluate combined policies
    const evaluationResult = evaluatePolicies(action, resource, aggregated);

    // 5. If denied — log and return immediately
    if (!evaluationResult.allowed) {
      logger.warn({ userId, action, resource, decision: evaluationResult.reason });
      return evaluationResult;
    }

    // 6. Evaluation allowed — now check boundary if one exists
    if (userData.boundaryPolicies.length > 0) {
      const boundaryResult = evaluateBoundary(
        userData.boundaryPolicies,
        action,
        resource
      );

      if (!boundaryResult.allowed) {
        logger.warn({ userId, action, resource, decision: 'BOUNDARY_DENY' });
        return boundaryResult;
      }
    }

    // 7. Final allow
    logger.info({
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
  private aggregateStatements(
    directPolicies: AggregatedPolicy[],
    groupPolicies: AggregatedPolicy[]
  ): AggregatedPolicy[] {
    const seen = new Set<string>();
    const result: AggregatedPolicy[] = [];

    for (const policy of [...directPolicies, ...groupPolicies]) {
      if (!seen.has(policy.id)) {
        seen.add(policy.id);
        result.push(policy);
      }
    }

    return result;
  }
}

// Export singleton instance for use across the app
export const permissionEngine = new PermissionEngine();
