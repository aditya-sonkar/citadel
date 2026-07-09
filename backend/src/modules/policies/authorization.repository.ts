import { prisma } from '../../core/database/prisma';
import { AggregatedPolicy, PolicyDocument, PolicyStatement } from '../../iam/iam.types';
import { logger } from '../../core/logger/logger';

export interface UserPermissionData {
  isRoot: boolean;
  directPolicies: AggregatedPolicy[];
  groupPolicies: AggregatedPolicy[];
  boundaryPolicies: AggregatedPolicy[];
}

/**
 * Safely parses a Prisma JSON field into PolicyStatement[].
 * Returns an empty array if malformed.
 */
const parseStatements = (raw: unknown, policyId: string): PolicyStatement[] => {
  try {
    const doc = raw as PolicyDocument;
    if (!doc || !Array.isArray(doc.statements)) {
      throw new Error('Invalid policy document structure');
    }
    return doc.statements;
  } catch (err) {
    logger.error({
      message: 'Failed to parse policy statements',
      policyId,
      error: err,
    });
    return [];
  }
};

/**
 * Loads all policies relevant to permission evaluation for a given user:
 *   - Direct user policy attachments
 *   - Group policy attachments (via user's group memberships)
 *   - Permissions boundary policy
 */
export const getUserPermissions = async (
  userId: string
): Promise<UserPermissionData | null> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      isRoot: true,
      policies: {
        select: {
          policy: {
            select: { id: true, name: true, statements: true },
          },
        },
      },
      memberships: {
        select: {
          group: {
            select: {
              policies: {
                select: {
                  policy: {
                    select: { id: true, name: true, statements: true },
                  },
                },
              },
            },
          },
        },
      },
      boundary: {
        select: {
          policy: {
            select: { id: true, name: true, statements: true },
          },
        },
      },
    },
  });

  if (!user) return null;

  const directPolicies: AggregatedPolicy[] = user.policies.map(({ policy }) => ({
    id: policy.id,
    name: policy.name,
    statements: parseStatements(policy.statements, policy.id),
  }));

  const groupPolicies: AggregatedPolicy[] = user.memberships.flatMap(({ group }) =>
    group.policies.map(({ policy }) => ({
      id: policy.id,
      name: policy.name,
      statements: parseStatements(policy.statements, policy.id),
    }))
  );

  const boundaryPolicies: AggregatedPolicy[] = user.boundary
    ? [
        {
          id: user.boundary.policy.id,
          name: user.boundary.policy.name,
          statements: parseStatements(
            user.boundary.policy.statements,
            user.boundary.policy.id
          ),
        },
      ]
    : [];

  return {
    isRoot: user.isRoot,
    directPolicies,
    groupPolicies,
    boundaryPolicies,
  };
};
