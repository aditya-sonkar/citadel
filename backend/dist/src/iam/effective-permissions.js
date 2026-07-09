"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildResolvedStatements = exports.intersectStatements = void 0;
const authorization_repository_1 = require("../modules/policies/authorization.repository");
const matcher_1 = require("./matcher");
/**
 * Computes the intersection of allowed statements between user policies and permissions boundaries.
 * Correctly handles overlapping wildcards symmetrically.
 */
const intersectStatements = (userAllows, boundaryAllows) => {
    const intersected = [];
    for (const userStmt of userAllows) {
        const actions = [];
        const resources = [];
        // Find overlapping actions
        for (const uAction of userStmt.Action) {
            for (const bStmt of boundaryAllows) {
                // Case A: User action pattern is allowed by boundary patterns (e.g. user is reports:Read, boundary is reports:*)
                if ((0, matcher_1.matchAction)(uAction, bStmt.Action)) {
                    actions.push(uAction);
                }
                // Case B: Boundary pattern is narrower than user pattern (e.g. user is *, boundary is reports:Read)
                for (const bAction of bStmt.Action) {
                    if ((0, matcher_1.matchAction)(bAction, [uAction])) {
                        actions.push(bAction);
                    }
                }
            }
        }
        // Find overlapping resources
        for (const uResource of userStmt.Resource) {
            for (const bStmt of boundaryAllows) {
                if ((0, matcher_1.matchResource)(uResource, bStmt.Resource)) {
                    resources.push(uResource);
                }
                for (const bResource of bStmt.Resource) {
                    if ((0, matcher_1.matchResource)(bResource, [uResource])) {
                        resources.push(bResource);
                    }
                }
            }
        }
        const uniqueActions = Array.from(new Set(actions));
        const uniqueResources = Array.from(new Set(resources));
        if (uniqueActions.length > 0 && uniqueResources.length > 0) {
            intersected.push({
                Effect: 'Allow',
                Action: uniqueActions,
                Resource: uniqueResources,
            });
        }
    }
    return intersected;
};
exports.intersectStatements = intersectStatements;
/**
 * Direct resolver to build the final effective policy document (resolvedStatements) in O(N).
 * Avoids N+1 query loops.
 */
const buildResolvedStatements = async (userId) => {
    const userData = await (0, authorization_repository_1.getUserPermissions)(userId);
    if (!userData)
        return null;
    // Root user has absolute permissions
    if (userData.isRoot) {
        return {
            user: { id: userId, email: userData.isRoot ? 'root@org.local' : '' },
            directPolicies: [],
            groupPolicies: [],
            boundary: null,
            resolvedStatements: [
                {
                    Effect: 'Allow',
                    Action: ['*'],
                    Resource: ['*'],
                },
            ],
        };
    }
    // 1. Gather direct and group allows and denies
    const userAllows = [];
    const userDenies = [];
    const extractStatements = (statements) => {
        for (const stmt of statements) {
            if (stmt.Effect === 'Deny') {
                userDenies.push(stmt);
            }
            else {
                userAllows.push(stmt);
            }
        }
    };
    for (const policy of userData.directPolicies) {
        extractStatements(policy.statements);
    }
    for (const policy of userData.groupPolicies) {
        extractStatements(policy.statements);
    }
    // 2. Resolve statement document based on Permissions Boundary presence
    let resolvedStatements = [];
    if (userData.boundaryPolicies.length > 0) {
        const boundaryAllows = [];
        const boundaryDenies = [];
        for (const policy of userData.boundaryPolicies) {
            for (const stmt of policy.statements) {
                if (stmt.Effect === 'Deny') {
                    boundaryDenies.push(stmt);
                }
                else {
                    boundaryAllows.push(stmt);
                }
            }
        }
        // Intersect Allow statements
        const intersectedAllows = (0, exports.intersectStatements)(userAllows, boundaryAllows);
        // Merge in Deny statements (explicit denies from user policies AND boundaries always win)
        resolvedStatements = [...intersectedAllows, ...userDenies, ...boundaryDenies];
    }
    else {
        // No boundary: resolved statements are simply user allows + user denies
        resolvedStatements = [...userAllows, ...userDenies];
    }
    return {
        user: { id: userId },
        directPolicies: userData.directPolicies.map((p) => ({ id: p.id, name: p.name })),
        groupPolicies: userData.groupPolicies.map((p) => ({ id: p.id, name: p.name })),
        boundary: userData.boundaryPolicies.length > 0
            ? { id: userData.boundaryPolicies[0].id, name: userData.boundaryPolicies[0].name }
            : null,
        resolvedStatements,
    };
};
exports.buildResolvedStatements = buildResolvedStatements;
