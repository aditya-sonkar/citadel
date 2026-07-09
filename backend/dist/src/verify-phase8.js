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
const PORT = 5009;
async function runTests() {
    console.log('--- Phase 8 E2E Audit Logs & Decision History Verification ---');
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
        // Clear previous setups
        await prisma_1.prisma.auditLog.deleteMany({});
        await prisma_1.prisma.userPolicyAttachment.deleteMany({ where: { userId: aliceUser.id } });
        await prisma_1.prisma.userPolicyAttachment.deleteMany({ where: { userId: bobUser.id } });
        await prisma_1.prisma.userBoundary.deleteMany({ where: { userId: bobUser.id } });
        await prisma_1.prisma.policy.deleteMany({
            where: { name: { in: ['DenyReportsRead8', 'AlertsOnlyPolicy8'] } },
        }).catch(() => { });
        // Cleanup test group left from previous runs
        const staleGroup = await prisma_1.prisma.group.findFirst({ where: { name: 'EngineeringAudit' } });
        if (staleGroup) {
            await prisma_1.prisma.groupPolicyAttachment.deleteMany({ where: { groupId: staleGroup.id } });
            await prisma_1.prisma.userGroupMembership.deleteMany({ where: { groupId: staleGroup.id } });
            await prisma_1.prisma.group.delete({ where: { id: staleGroup.id } });
        }
        // Seed default ReadOnlyAccess to Alice
        const readOnlyPolicy = await prisma_1.prisma.policy.findFirst({ where: { name: 'ReadOnlyAccess' } });
        if (readOnlyPolicy) {
            await prisma_1.prisma.userPolicyAttachment.create({
                data: { userId: aliceUser.id, policyId: readOnlyPolicy.id },
            });
        }
        console.log('Database state initialized successfully!');
        // Tokens
        const rootToken = (0, jwt_1.generateAccessToken)({ userId: rootUser.id, email: rootUser.email, isRoot: true });
        const aliceToken = (0, jwt_1.generateAccessToken)({ userId: aliceUser.id, email: aliceUser.email, isRoot: false });
        const bobToken = (0, jwt_1.generateAccessToken)({ userId: bobUser.id, email: bobUser.email, isRoot: false });
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
        const getAuditLogWithRetry = async (where) => {
            for (let i = 0; i < 20; i++) {
                const found = await prisma_1.prisma.auditLog.findFirst({
                    where,
                    orderBy: { timestamp: 'desc' },
                });
                if (found)
                    return found;
                await new Promise((r) => setTimeout(r, 50));
            }
            return null;
        };
        console.log('\n--- Running Part 1: Decision Captures E2E ---');
        // 1. Alice Access reports normally (ALLOW_MATCH)
        await testCase('Alice accesses reports normally', 'GET', '/api/resources/reports', null, aliceToken, 200);
        // Assert decision in database is ALLOW_MATCH
        let logged = await getAuditLogWithRetry({ action: 'reports:Read', userId: aliceUser.id, effect: client_1.AuditEffect.Allow });
        console.log(`   Assert reports:Read is ALLOW_MATCH -> ${logged?.decision === client_1.AuditDecision.ALLOW_MATCH ? 'PASS' : 'FAIL'} (Got: ${logged?.decision})`);
        // 2. Alice hits reports after attaching Deny policy (EXPLICIT_DENY)
        const denyReportsPolicy = await prisma_1.prisma.policy.create({
            data: {
                name: 'DenyReportsRead8',
                type: client_1.PolicyType.MANAGED,
                statements: {
                    statements: [{ Effect: 'Deny', Action: ['reports:Read'], Resource: ['*'] }],
                },
            },
        });
        await prisma_1.prisma.userPolicyAttachment.create({
            data: { userId: aliceUser.id, policyId: denyReportsPolicy.id },
        });
        await testCase('Alice blocked from reports (Explicit Deny)', 'GET', '/api/resources/reports', null, aliceToken, 403);
        // Assert decision is EXPLICIT_DENY
        logged = await getAuditLogWithRetry({ action: 'reports:Read', userId: aliceUser.id, effect: client_1.AuditEffect.Deny });
        console.log(`   Assert reports:Read is EXPLICIT_DENY -> ${logged?.decision === client_1.AuditDecision.EXPLICIT_DENY ? 'PASS' : 'FAIL'} (Got: ${logged?.decision})`);
        // Cleanup Alice Deny policy
        await prisma_1.prisma.userPolicyAttachment.delete({
            where: { userId_policyId: { userId: aliceUser.id, policyId: denyReportsPolicy.id } },
        });
        // 3. Bob accesses reports under boundary restriction (BOUNDARY_DENY)
        // Bob has ReportsFullAccess direct policy, but AlertsOnly boundary policy
        const reportsFullPolicy = await prisma_1.prisma.policy.findFirst({ where: { name: 'ReportsFullAccess' } });
        const alertsOnlyPolicy = await prisma_1.prisma.policy.create({
            data: {
                name: 'AlertsOnlyPolicy8',
                type: client_1.PolicyType.MANAGED,
                statements: {
                    statements: [{ Effect: 'Allow', Action: ['alerts:*'], Resource: ['*'] }],
                },
            },
        });
        if (reportsFullPolicy) {
            await prisma_1.prisma.userPolicyAttachment.create({
                data: { userId: bobUser.id, policyId: reportsFullPolicy.id },
            });
        }
        await prisma_1.prisma.userBoundary.create({
            data: { userId: bobUser.id, policyId: alertsOnlyPolicy.id },
        });
        await testCase('Bob blocked from reports (Boundary Deny)', 'GET', '/api/resources/reports', null, bobToken, 403);
        // Assert decision is BOUNDARY_DENY
        logged = await getAuditLogWithRetry({ userId: bobUser.id, action: 'reports:Read' });
        console.log(`   Assert reports:Read is BOUNDARY_DENY -> ${logged?.decision === client_1.AuditDecision.BOUNDARY_DENY ? 'PASS' : 'FAIL'} (Got: ${logged?.decision})`);
        // 4. Root accesses admin (ROOT_BYPASS)
        await testCase('Root accesses admin', 'GET', '/api/resources/admin', null, rootToken, 200);
        // Assert decision is ROOT_BYPASS
        logged = await getAuditLogWithRetry({ action: 'admin:Access', userId: rootUser.id });
        console.log(`   Assert admin:Access is ROOT_BYPASS -> ${logged?.decision === client_1.AuditDecision.ROOT_BYPASS ? 'PASS' : 'FAIL'} (Got: ${logged?.decision})`);
        console.log('\n--- Running Part 2: Mutation Audits ---');
        // 5. Create Group
        let testGroupId = '';
        await testCase('Create Group Engineering', 'POST', '/api/iam/groups', { name: 'EngineeringAudit', description: 'Auditable engineering group' }, rootToken, 201, (body) => { testGroupId = body.data.id; });
        // Assert mutation target details (filter by targetType to get service-level log, not middleware log)
        logged = await getAuditLogWithRetry({ action: 'iam:CreateGroup', targetType: 'group' });
        console.log(`   Assert targetType matches "group" -> ${logged?.targetType === 'group' ? 'PASS' : 'FAIL'}`);
        console.log(`   Assert targetId matches group ID -> ${logged?.targetId === testGroupId ? 'PASS' : 'FAIL'}`);
        console.log('\n--- Running Part 3: Resilience Failure Test ---');
        // Mock prisma.auditLog.create to throw error
        const originalCreate = prisma_1.prisma.auditLog.create;
        prisma_1.prisma.auditLog.create = async () => {
            throw new Error('Database simulated timeout failure');
        };
        // Alice accesses `/reports` (ALLOW_MATCH) -> should STILL return 200 even though logging fails!
        await testCase('Resilience Test: Alice accesses reports during database logging timeout', 'GET', '/api/resources/reports', null, aliceToken, 200);
        // Restore original Prisma write method
        prisma_1.prisma.auditLog.create = originalCreate;
        console.log('\n--- Running Part 4: Query Filters & Audit Details APIs ---');
        // 6. Get Audit logs (List view)
        let firstLogId = '';
        await testCase('Query Audit Logs list view', 'GET', '/api/iam/audit-logs?page=1&limit=5', null, rootToken, 200, (body) => {
            firstLogId = body.data.items[0]?.id;
            console.log(`   Extracted First Log ID: ${firstLogId}`);
        });
        // 7. Get Audit log details
        await testCase('Query specific audit log details', 'GET', `/api/iam/audit-logs/${firstLogId}`, null, rootToken, 200);
        // 8. Error Case A: Valid UUID not found
        await testCase('Valid UUID not found (404)', 'GET', '/api/iam/audit-logs/00000000-0000-0000-0000-000000000000', null, rootToken, 404);
        // 9. Error Case B: Invalid UUID format
        await testCase('Invalid UUID format (400)', 'GET', '/api/iam/audit-logs/not-a-uuid', null, rootToken, 400);
        // Cleanup Charlie / Bob entries
        await prisma_1.prisma.userPolicyAttachment.deleteMany({ where: { userId: bobUser.id } }).catch(() => { });
        await prisma_1.prisma.userBoundary.deleteMany({ where: { userId: bobUser.id } }).catch(() => { });
        await prisma_1.prisma.groupPolicyAttachment.deleteMany({ where: { groupId: testGroupId } }).catch(() => { });
        await prisma_1.prisma.group.delete({ where: { id: testGroupId } }).catch(() => { });
        // Clean up temporary database entries
        await prisma_1.prisma.policy.delete({ where: { id: denyReportsPolicy.id } }).catch(() => { });
        await prisma_1.prisma.policy.delete({ where: { id: alertsOnlyPolicy.id } }).catch(() => { });
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
