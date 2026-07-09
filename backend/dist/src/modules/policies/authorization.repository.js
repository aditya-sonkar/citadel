"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserPermissions = void 0;
const prisma_1 = require("../../core/database/prisma");
const logger_1 = require("../../core/logger/logger");
/**
 * Safely parses a Prisma JSON field into PolicyStatement[].
 * Returns an empty array if malformed.
 */
const parseStatements = (raw, policyId) => {
    try {
        const doc = raw;
        if (!doc || !Array.isArray(doc.statements)) {
            throw new Error('Invalid policy document structure');
        }
        return doc.statements;
    }
    catch (err) {
        logger_1.logger.error({
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
const getUserPermissions = async (userId) => {
    const user = await prisma_1.prisma.user.findUnique({
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
    if (!user)
        return null;
    const directPolicies = user.policies.map(({ policy }) => ({
        id: policy.id,
        name: policy.name,
        statements: parseStatements(policy.statements, policy.id),
    }));
    const groupPolicies = user.memberships.flatMap(({ group }) => group.policies.map(({ policy }) => ({
        id: policy.id,
        name: policy.name,
        statements: parseStatements(policy.statements, policy.id),
    })));
    const boundaryPolicies = user.boundary
        ? [
            {
                id: user.boundary.policy.id,
                name: user.boundary.policy.name,
                statements: parseStatements(user.boundary.policy.statements, user.boundary.policy.id),
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
exports.getUserPermissions = getUserPermissions;
