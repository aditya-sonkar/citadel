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
const PORT = 5007;
async function runTests() {
    console.log('--- Phase 5.5 & Phase 6 E2E Verification ---');
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
                name: 'Root',
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
                name: 'Alice',
                passwordHash: 'dummy',
                isRoot: false,
            },
        });
        // Create a standard test user (Bob)
        const bobUser = await prisma_1.prisma.user.upsert({
            where: { email: 'bob@org.local' },
            update: { isRoot: false },
            create: {
                email: 'bob@org.local',
                name: 'Bob',
                passwordHash: 'dummy',
                isRoot: false,
            },
        });
        // Ensure Bob's previous attachments are cleaned up
        await prisma_1.prisma.userPolicyAttachment.deleteMany({ where: { userId: bobUser.id } });
        await prisma_1.prisma.userBoundary.deleteMany({ where: { userId: bobUser.id } });
        console.log('Database state initialized successfully!');
        // Tokens
        const rootToken = (0, jwt_1.generateAccessToken)({ userId: rootUser.id, email: rootUser.email, isRoot: true });
        const aliceToken = (0, jwt_1.generateAccessToken)({ userId: aliceUser.id, email: aliceUser.email, isRoot: false });
        const bobToken = (0, jwt_1.generateAccessToken)({ userId: bobUser.id, email: bobUser.email, isRoot: false });
        // Track a created group ID and policy ID for testing
        let testGroupId = '';
        let customManagedPolicyId = '';
        let customInlinePolicyId = '';
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
        console.log('\n--- Running Phase 6 Groups CRUD Tests ---');
        // 1. Create Group
        const newGroupPayload = {
            name: 'Engineering',
            description: 'Engineering core group',
        };
        await testCase('Create Group Engineering', 'POST', '/api/iam/groups', newGroupPayload, rootToken, 201, (body) => {
            testGroupId = body.data.id;
            console.log(`   Created Group ID: ${testGroupId}`);
        });
        // 2. Duplicate Group Name Check (case-insensitive)
        const duplicateGroupPayload = {
            name: '  engineering  ',
        };
        await testCase('Duplicate Group Name Blocked', 'POST', '/api/iam/groups', duplicateGroupPayload, rootToken, 409);
        // 3. List Groups with pagination and counts validation
        await testCase('List Groups (pagination counts checks)', 'GET', '/api/iam/groups?page=1&limit=5', null, rootToken, 200, (body) => {
            const item = body.data.items.find((g) => g.id === testGroupId);
            const hasCounts = item && item.memberCount !== undefined && item.attachedPolicyCount !== undefined;
            console.log(`   Listing Counts Verification: ${hasCounts ? 'PASSED' : 'FAILED'} (members: ${item?.memberCount}, policies: ${item?.attachedPolicyCount})`);
        });
        // 4. Update Group info (PATCH)
        const patchGroupPayload = {
            description: 'Updated Engineering group description',
        };
        await testCase('Update Group Engineering description', 'PATCH', `/api/iam/groups/${testGroupId}`, patchGroupPayload, rootToken, 200);
        console.log('\n--- Running Phase 6 Membership Tests ---');
        // 5. Add user to group
        await testCase('Add Alice to Engineering Group', 'POST', `/api/iam/groups/${testGroupId}/members`, { userId: aliceUser.id }, rootToken, 201);
        // 6. Duplicate membership block
        await testCase('Duplicate membership blocked', 'POST', `/api/iam/groups/${testGroupId}/members`, { userId: aliceUser.id }, rootToken, 409);
        // 7. Group detail verification (include members)
        await testCase('Verify Group detail members list', 'GET', `/api/iam/groups/${testGroupId}`, null, rootToken, 200, (body) => {
            const containsAlice = body.data.members.some((m) => m.id === aliceUser.id);
            console.log(`   Group detail members validation: ${containsAlice ? 'PASSED' : 'FAILED'}`);
        });
        console.log('\n--- Running Phase 6 Policy Attachments Tests ---');
        // Create a custom MANAGED policy
        const customManagedPayload = {
            name: 'CustomManagedPolicy',
            type: 'MANAGED',
            statements: {
                statements: [{ Effect: 'Allow', Action: ['reports:Read'], Resource: ['*'] }],
            },
        };
        await testCase('Create custom MANAGED policy', 'POST', '/api/policies', customManagedPayload, rootToken, 201, (body) => { customManagedPolicyId = body.data.id; });
        // Create a custom INLINE policy
        const customInlinePayload = {
            name: 'CustomInlinePolicy',
            type: 'INLINE',
            statements: {
                statements: [{ Effect: 'Allow', Action: ['reports:Read'], Resource: ['*'] }],
            },
        };
        await testCase('Create custom INLINE policy', 'POST', '/api/policies', customInlinePayload, rootToken, 201, (body) => { customInlinePolicyId = body.data.id; });
        // 8. Block INLINE policy attachment to group
        await testCase('Inline policy attachment blocked', 'POST', `/api/iam/groups/${testGroupId}/policies`, { policyId: customInlinePolicyId }, rootToken, 400);
        // 9. Attach MANAGED policy to group
        await testCase('Attach Managed policy to group', 'POST', `/api/iam/groups/${testGroupId}/policies`, { policyId: customManagedPolicyId }, rootToken, 200);
        // 10. Duplicate policy attachment block
        await testCase('Duplicate policy attachment blocked', 'POST', `/api/iam/groups/${testGroupId}/policies`, { policyId: customManagedPolicyId }, rootToken, 409);
        console.log('\n--- Running Phase 5.5 Delegation Bypass Prevention Tests ---');
        // 11. Create policy delegation block (Alice attempts to create reports:Delete policy)
        const escalatePolicyPayload = {
            name: 'EscalatedPolicy',
            type: 'MANAGED',
            statements: {
                statements: [{ Effect: 'Allow', Action: ['reports:Delete'], Resource: ['*'] }],
            },
        };
        await testCase('Alice attempts to create reports:Delete policy (Delegation Block)', 'POST', '/api/policies', escalatePolicyPayload, aliceToken, 403);
        // 12. Attach policy delegation block (Alice attempts to attach customManagedPolicyId which has reports:Read, but Alice has only ReadOnlyAccess. Wait, Alice DOES have reports:Read! So she should succeed.)
        // Let's test Alice attempting to attach a policy she does NOT possess.
        // Let's create an admin:Access policy using Root
        const adminPolicyPayload = {
            name: 'AdminAccessPolicy',
            type: 'MANAGED',
            statements: {
                statements: [{ Effect: 'Allow', Action: ['admin:Access'], Resource: ['*'] }],
            },
        };
        let adminPolicyId = '';
        await testCase('Root creates admin policy', 'POST', '/api/policies', adminPolicyPayload, rootToken, 201, (body) => { adminPolicyId = body.data.id; });
        // Now Alice attempts to attach AdminAccessPolicy to Engineering group.
        await testCase('Alice attempts to attach AdminAccessPolicy to group (Delegation Block)', 'POST', `/api/iam/groups/${testGroupId}/policies`, { policyId: adminPolicyId }, aliceToken, 403);
        console.log('\n--- Running Boundary + Delegation Combined Edge Case Tests ---');
        // Setup Bob: Bob has direct UserPolicy allowing reports:Delete, but boundary only allows alerts:*
        const reportsDeletePolicy = await prisma_1.prisma.policy.create({
            data: {
                name: 'ReportsDeletePolicy',
                type: client_1.PolicyType.MANAGED,
                statements: {
                    statements: [{ Effect: 'Allow', Action: ['reports:Delete'], Resource: ['*'] }],
                },
            },
        });
        const alertsOnlyPolicy = await prisma_1.prisma.policy.create({
            data: {
                name: 'AlertsOnlyPolicy',
                type: client_1.PolicyType.MANAGED,
                statements: {
                    statements: [{ Effect: 'Allow', Action: ['alerts:*'], Resource: ['*'] }],
                },
            },
        });
        // Attach allow policy to Bob
        await prisma_1.prisma.userPolicyAttachment.create({
            data: { userId: bobUser.id, policyId: reportsDeletePolicy.id },
        });
        // Attach restrict boundary to Bob
        await prisma_1.prisma.userBoundary.create({
            data: { userId: bobUser.id, policyId: alertsOnlyPolicy.id },
        });
        // Bob attempts to delegate reports:Delete by creating a policy with it. (Expected: 403 Blocked because boundary restricts reports:Delete).
        await testCase('Bob attempts to create reports:Delete policy (Boundary-restricted Delegation Block)', 'POST', '/api/policies', {
            name: 'BobDelegatedReportsDelete',
            type: 'MANAGED',
            statements: {
                statements: [{ Effect: 'Allow', Action: ['reports:Delete'], Resource: ['*'] }],
            },
        }, bobToken, 403);
        console.log('\n--- Running Explicit Deny Precedence check (IAM engine) ---');
        // Alice normally has access to `/reports` (200 OK)
        await testCase('Alice accesses reports normally', 'GET', '/api/resources/reports', null, aliceToken, 200);
        // Create an explicit Deny reports:Read policy
        const denyReportsReadPolicy = await prisma_1.prisma.policy.create({
            data: {
                name: 'DenyReportsRead',
                type: client_1.PolicyType.MANAGED,
                statements: {
                    statements: [{ Effect: 'Deny', Action: ['reports:Read'], Resource: ['*'] }],
                },
            },
        });
        // Attach Deny policy directly to Alice
        const aliceAttachment = await prisma_1.prisma.userPolicyAttachment.create({
            data: { userId: aliceUser.id, policyId: denyReportsReadPolicy.id },
        });
        // Alice accesses `/reports` now (Expected: 403 Forbidden because Deny wins!)
        await testCase('Alice accesses reports with attached Deny Policy (Explicit Deny Wins)', 'GET', '/api/resources/reports', null, aliceToken, 403);
        // Clean up Alice Deny attachment
        await prisma_1.prisma.userPolicyAttachment.delete({
            where: {
                userId_policyId: { userId: aliceUser.id, policyId: denyReportsReadPolicy.id },
            },
        });
        console.log('\n--- Running Cleanup & Transaction Tests ---');
        // Remove Alice from group Engineering
        await testCase('Remove Alice from Engineering group', 'DELETE', `/api/iam/groups/${testGroupId}/members/${aliceUser.id}`, null, rootToken, 200);
        // Detach Managed Policy from group Engineering
        await testCase('Detach customManagedPolicy from Engineering group', 'DELETE', `/api/iam/groups/${testGroupId}/policies/${customManagedPolicyId}`, null, rootToken, 200);
        // Delete group Engineering (covers transactional cleanup of memberships, policies, group)
        await testCase('Delete Engineering Group (Transaction Cleanup)', 'DELETE', `/api/iam/groups/${testGroupId}`, null, rootToken, 200);
        // Clean up temporary database entries
        await prisma_1.prisma.policy.delete({ where: { id: reportsDeletePolicy.id } }).catch(() => { });
        await prisma_1.prisma.policy.delete({ where: { id: alertsOnlyPolicy.id } }).catch(() => { });
        await prisma_1.prisma.policy.delete({ where: { id: denyReportsReadPolicy.id } }).catch(() => { });
        await prisma_1.prisma.policy.delete({ where: { id: customManagedPolicyId } }).catch(() => { });
        await prisma_1.prisma.policy.delete({ where: { id: customInlinePolicyId } }).catch(() => { });
        await prisma_1.prisma.policy.delete({ where: { id: adminPolicyId } }).catch(() => { });
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
