"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const prisma_1 = require("./core/database/prisma");
const jwt_1 = require("./core/utils/jwt");
const client_1 = require("@prisma/client");
const PORT = 5008;
async function runTests() {
    console.log('--- Phase 7 E2E Users IAM & Boundaries Verification ---');
    // Start temporary server
    const server = http_1.default.createServer(app_1.default);
    await new Promise((resolve) => {
        server.listen(PORT, () => {
            console.log(`Test server running on port ${PORT}`);
            resolve();
        });
    });
    try {
        // 1. Setup database states
        console.log('\nSetting up database states...');
        // Retrieve seeded user or create Root
        const rootUser = await prisma_1.prisma.user.upsert({
            where: { email: 'root@org.local' },
            update: { isRoot: true },
            create: {
                email: 'root@org.local',
                name: 'Root User',
                passwordHash: 'dummy',
                isRoot: true,
            },
        });
        // Retrieve seeded user or create Alice
        const aliceUser = await prisma_1.prisma.user.upsert({
            where: { email: 'alice@org.local' },
            update: { isRoot: false },
            create: {
                email: 'alice@org.local',
                name: 'Alice User',
                passwordHash: 'dummy',
                isRoot: false,
            },
        });
        // Retrieve seeded user or create Bob
        const bobUser = await prisma_1.prisma.user.upsert({
            where: { email: 'bob@org.local' },
            update: { isRoot: false },
            create: {
                email: 'bob@org.local',
                name: 'Bob User',
                passwordHash: 'dummy',
                isRoot: false,
            },
        });
        // Clean attachments
        await prisma_1.prisma.userPolicyAttachment.deleteMany({ where: { userId: bobUser.id } }).catch(() => { });
        await prisma_1.prisma.userBoundary.deleteMany({ where: { userId: bobUser.id } }).catch(() => { });
        await prisma_1.prisma.userPolicyAttachment.deleteMany({ where: { userId: rootUser.id } }).catch(() => { });
        await prisma_1.prisma.userBoundary.deleteMany({ where: { userId: rootUser.id } }).catch(() => { });
        console.log('Database state initialized successfully!');
        // Tokens
        const rootToken = (0, jwt_1.generateAccessToken)({ userId: rootUser.id, email: rootUser.email, isRoot: true });
        const aliceToken = (0, jwt_1.generateAccessToken)({ userId: aliceUser.id, email: aliceUser.email, isRoot: false });
        // Track policy IDs created for testing
        let customManagedPolicyId = '';
        let customInlinePolicyId = '';
        let adminPolicyId = '';
        // Test runner helper
        const testCase = async (name, method, path, body, token, expectedStatus, validateBody) => {
            const headers = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            try {
                const response = await fetch(`http://localhost:${PORT}${path}`, {
                    method,
                    headers,
                    body: body ? JSON.stringify(body) : undefined,
                });
                const status = response.status;
                const text = await response.text();
                const success = status === expectedStatus;
                console.log(`${success ? '✅' : '❌'} [${name}] ${method} ${path} -> Got ${status}, Expected ${expectedStatus} (${success ? 'PASS' : 'FAIL'})`);
                if (!success) {
                    console.log(`   Response body: ${text}`);
                }
                else if (validateBody && text) {
                    try {
                        const parsed = JSON.parse(text);
                        validateBody(parsed);
                    }
                    catch (e) {
                        console.log(`   Failed to validate parsed body:`, e);
                    }
                }
            }
            catch (err) {
                console.log(`❌ [${name}] ${method} ${path} failed to fetch:`, err);
            }
        };
        console.log('\n--- Running User List & Details Tests ---');
        // 1. List Users (Counts validation)
        await testCase('List Users (Counts validation)', 'GET', '/api/iam/users?page=1&limit=5', null, rootToken, 200, (body) => {
            const hasCounts = body.data.items.every((u) => u.policyCount !== undefined && u.groupCount !== undefined && u.hasBoundary !== undefined);
            console.log(`   Users list counts presence: ${hasCounts ? 'PASSED' : 'FAILED'}`);
        });
        // 2. User Detail details
        await testCase('Get Bob user details', 'GET', `/api/iam/users/${bobUser.id}`, null, rootToken, 200, (body) => {
            const isValid = body.data.policyCount !== undefined &&
                body.data.groupCount !== undefined &&
                body.data.hasBoundary !== undefined;
            console.log(`   User detail counts validation: ${isValid ? 'PASSED' : 'FAILED'}`);
        });
        console.log('\n--- Running User Policy Attachments Tests ---');
        // Create custom policies
        const managedPayload = {
            name: 'UserManagedPolicy',
            type: 'MANAGED',
            statements: {
                statements: [{ Effect: 'Allow', Action: ['reports:Read'], Resource: ['*'] }],
            },
        };
        await testCase('Create Managed Policy', 'POST', '/api/policies', managedPayload, rootToken, 201, (body) => { customManagedPolicyId = body.data.id; });
        const inlinePayload = {
            name: 'UserInlinePolicy',
            type: 'INLINE',
            statements: {
                statements: [{ Effect: 'Allow', Action: ['reports:Read'], Resource: ['*'] }],
            },
        };
        await testCase('Create Inline Policy', 'POST', '/api/policies', inlinePayload, rootToken, 201, (body) => { customInlinePolicyId = body.data.id; });
        // 3. Block Inline attachments
        await testCase('Attach Inline Policy Blocked', 'POST', `/api/iam/users/${bobUser.id}/policies`, { policyId: customInlinePolicyId }, rootToken, 400);
        // 4. Attach Managed Policy
        await testCase('Attach Managed Policy to Bob', 'POST', `/api/iam/users/${bobUser.id}/policies`, { policyId: customManagedPolicyId }, rootToken, 200);
        // 5. Block duplicate attachment
        await testCase('Block Duplicate policy attachment', 'POST', `/api/iam/users/${bobUser.id}/policies`, { policyId: customManagedPolicyId }, rootToken, 409);
        // 6. Block Alice (viewer) from attaching admin privileges (Delegation Bypass)
        const adminPolicyPayload = {
            name: 'UserAdminAccess',
            type: 'MANAGED',
            statements: {
                statements: [{ Effect: 'Allow', Action: ['admin:Access'], Resource: ['*'] }],
            },
        };
        await testCase('Create Admin Policy via Root', 'POST', '/api/policies', adminPolicyPayload, rootToken, 201, (body) => { adminPolicyId = body.data.id; });
        await testCase('Alice attempts to attach admin policy to Bob (Delegation Block)', 'POST', `/api/iam/users/${bobUser.id}/policies`, { policyId: adminPolicyId }, aliceToken, 403);
        console.log('\n--- Running Permissions Boundary Tests ---');
        // 7. Put Permissions Boundary
        await testCase('Set customManagedPolicy as Bob boundary', 'PUT', `/api/iam/users/${bobUser.id}/boundary`, { policyId: customManagedPolicyId }, rootToken, 200);
        // 8. Self-Lockout Protection validation (callerUserId === targetUserId)
        // Root user sets a boundary on Root that denies policies:List (Root has bypass, so lockout doesn't run, but wait, self-lockout check runs if target === caller and user has no root bypass? In our code:
        // root is exempt because they are isRoot. Let's register a non-root admin token or create a standard admin user.
        // Let's create an Admin User (Charlie) with PolicyAdministrator attachment
        const charlieUser = await prisma_1.prisma.user.upsert({
            where: { email: 'charlie@org.local' },
            update: { isRoot: false },
            create: {
                email: 'charlie@org.local',
                name: 'Charlie Admin',
                passwordHash: 'dummy',
                isRoot: false,
            },
        });
        const policyAdminSeeded = await prisma_1.prisma.policy.findFirst({
            where: { name: 'PolicyAdministrator' },
        });
        if (policyAdminSeeded) {
            await prisma_1.prisma.userPolicyAttachment.upsert({
                where: { userId_policyId: { userId: charlieUser.id, policyId: policyAdminSeeded.id } },
                update: {},
                create: { userId: charlieUser.id, policyId: policyAdminSeeded.id },
            });
        }
        // Charlie also needs all permissions (like reports:Read) to satisfy boundary delegation checks
        const charlieIamAdminPolicy = await prisma_1.prisma.policy.create({
            data: {
                name: 'CharlieIamAdminPolicy',
                type: client_1.PolicyType.MANAGED,
                statements: {
                    statements: [{ Effect: 'Allow', Action: ['*'], Resource: ['*'] }],
                },
            },
        });
        await prisma_1.prisma.userPolicyAttachment.create({
            data: { userId: charlieUser.id, policyId: charlieIamAdminPolicy.id },
        });
        const charlieToken = (0, jwt_1.generateAccessToken)({ userId: charlieUser.id, email: charlieUser.email, isRoot: false });
        // Charlie attempts to put customManagedPolicy (which only allows reports:Read, and restricts policies:List) as Charlie's boundary.
        // Expected: 400 Bad Request because it locks Charlie out from Policies and Users IAM!
        await testCase('Charlie attempts self-lockout boundary (Self-Lockout Block)', 'PUT', `/api/iam/users/${charlieUser.id}/boundary`, { policyId: customManagedPolicyId }, charlieToken, 400);
        // Charlie puts boundary on Bob (targetUserId !== callerUserId) which restricts critical permissions.
        // Expected: 200 OK (lockout bypasses since target is not self!).
        await testCase('Charlie puts restricting boundary on Bob (Lockout Skips)', 'PUT', `/api/iam/users/${bobUser.id}/boundary`, { policyId: customManagedPolicyId }, charlieToken, 200);
        // 9. Delete non-existing boundary checks
        await testCase('Delete Bob Boundary', 'DELETE', `/api/iam/users/${bobUser.id}/boundary`, null, rootToken, 200);
        await testCase('Delete Bob Boundary again (Not Found)', 'DELETE', `/api/iam/users/${bobUser.id}/boundary`, null, rootToken, 404);
        console.log('\n--- Running Direct Policy Detach Protections ---');
        // 10. Detach protection for Root user
        if (policyAdminSeeded) {
            // Attach to Root first
            await prisma_1.prisma.userPolicyAttachment.upsert({
                where: { userId_policyId: { userId: rootUser.id, policyId: policyAdminSeeded.id } },
                update: {},
                create: { userId: rootUser.id, policyId: policyAdminSeeded.id },
            });
            // Detach attempt on Root
            await testCase('Attempt to detach PolicyAdministrator from Root (Protected Block)', 'DELETE', `/api/iam/users/${rootUser.id}/policies/${policyAdminSeeded.id}`, null, rootToken, 403);
        }
        // 11. Detach standard policy from Bob
        await testCase('Detach customManagedPolicy from Bob', 'DELETE', `/api/iam/users/${bobUser.id}/policies/${customManagedPolicyId}`, null, rootToken, 200);
        // 12. Detach non-existent policy attachment
        await testCase('Detach non-existent policy attachment (Not Found)', 'DELETE', `/api/iam/users/${bobUser.id}/policies/${customManagedPolicyId}`, null, rootToken, 404);
        // No longer testing Resolved Statements & Effective Access endpoints as they are removed.
        // Cleanup charlie
        await prisma_1.prisma.userPolicyAttachment.deleteMany({ where: { userId: charlieUser.id } }).catch(() => { });
        await prisma_1.prisma.user.delete({ where: { id: charlieUser.id } }).catch(() => { });
        // Clean up temporary database entries
        await prisma_1.prisma.policy.delete({ where: { id: customManagedPolicyId } }).catch(() => { });
        await prisma_1.prisma.policy.delete({ where: { id: customInlinePolicyId } }).catch(() => { });
        await prisma_1.prisma.policy.delete({ where: { id: adminPolicyId } }).catch(() => { });
        await prisma_1.prisma.policy.delete({ where: { name: 'CharlieIamAdminPolicy' } }).catch(() => { });
    }
    catch (error) {
        console.error('Error during test execution:', error);
    }
    finally {
        await prisma_1.prisma.$disconnect();
        server.close(() => {
            console.log('\nTest server shut down cleanly.');
        });
    }
}
runTests();
