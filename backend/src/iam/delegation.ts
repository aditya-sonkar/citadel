import { permissionEngine } from './permission-engine';
import { getUserPermissions } from '../modules/policies/authorization.repository';
import { PolicyStatement } from './iam.types';
import { ApiError } from '../shared/ApiError';
import { HTTP_STATUS } from '../core/utils/constants';

/**
 * Validates that the caller has all the permissions that are being delegated.
 * Evaluates both caller's policies and Permissions Boundaries.
 * Throws a 403 Forbidden ApiError if any delegated permission is not possessed by the caller.
 * Bypasses checks if the caller is a Root user.
 */
export const verifyDelegation = async (
  callerUserId: string,
  statements: PolicyStatement[]
): Promise<void> => {
  // Pre-load caller permissions in a single database query to optimize calls
  const userData = await getUserPermissions(callerUserId);
  if (!userData) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Caller profile not found');
  }

  // Root users bypass all delegation restrictions
  if (userData.isRoot) {
    return;
  }

  // Evaluate each allowed permission in the statements list
  for (const statement of statements) {
    if (statement.Effect !== 'Allow') continue;

    for (const action of statement.Action) {
      for (const resource of statement.Resource) {
        // Reuse permission engine's hasPermission logic (single source of truth)
        const evaluation = await permissionEngine.hasPermission(
          callerUserId,
          action,
          resource,
          userData
        );

        if (!evaluation.allowed) {
          throw new ApiError(
            HTTP_STATUS.FORBIDDEN,
            `Delegation bypass blocked: You do not possess the required permission "${action}" on resource "${resource}"`
          );
        }
      }
    }
  }
};
