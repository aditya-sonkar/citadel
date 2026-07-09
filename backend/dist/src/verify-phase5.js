"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const prisma_1 = require("./core/database/prisma");
const jwt_1 = require("./core/utils/jwt");
const PORT = 5006;
async function runTests() {
    console.log('--- Phase 5 E2E Policies CRUD Verification ---');
    // Start temporary server
    const server = http_1.default.createServer(app_1.default);
    await new Promise((resolve) => {
        server.listen(PORT, () => {
            console.log(`Test server running on port ${PORT}`);
            resolve();
        });
    });
    try {
        // 1. Setup/Verify test database states
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
        // Ensure system policies exist
        const readOnlyPolicy = await prisma_1.prisma.policy.findUnique({
            where: { name: 'ReadOnlyAccess' },
        });
        if (!readOnlyPolicy) {
            throw new Error('System policies not seeded in database. Please run migrations/seed first.');
        }
        console.log('Database state initialized successfully!');
        // Tokens
        const rootToken = (0, jwt_1.generateAccessToken)({ userId: rootUser.id, email: rootUser.email, isRoot: true });
        const aliceToken = (0, jwt_1.generateAccessToken)({ userId: aliceUser.id, email: aliceUser.email, isRoot: false });
        // Track a created policy ID for later tests
        let customPolicyId = '';
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
        console.log('\n--- Running Test Cases ---');
        // 1. 401 No Token
        await testCase('1. 401 No Token', 'GET', '/api/policies', null, null, 401);
        // 2. 403 No Permission (Alice cannot create policies)
        const newPolicyPayload = {
            name: 'CustomTestPolicy',
            description: 'Test policy description',
            type: 'MANAGED',
            statements: {
                statements: [
                    {
                        Effect: 'Allow',
                        Action: ['reports:Read'],
                        Resource: ['*'],
                    },
                ],
            },
        };
        await testCase('2. 403 No Permission', 'POST', '/api/policies', newPolicyPayload, aliceToken, 403);
        // 3. 201 Create Policy (using rootToken)
        await testCase('3. 201 Create Policy', 'POST', '/api/policies', newPolicyPayload, rootToken, 201, (body) => {
            customPolicyId = body.data.id;
            console.log(`   Created Custom Policy ID: ${customPolicyId}`);
        });
        // 4. 409 Duplicate Name (case-insensitive name uniqueness)
        const duplicatePayload = {
            ...newPolicyPayload,
            name: '  customtestpolicy  ', // padded spaces and different case
        };
        await testCase('4. 409 Duplicate Name', 'POST', '/api/policies', duplicatePayload, rootToken, 409);
        // 5. 200 List Policies (Pagination, Search, Sorting)
        await testCase('5. 200 List Policies', 'GET', '/api/policies?page=1&limit=2&search=customtest', null, rootToken, 200, (body) => {
            const hasItems = body.data.items && Array.isArray(body.data.items);
            const hasPagination = body.data.pagination &&
                body.data.pagination.page === 1 &&
                body.data.pagination.limit === 2 &&
                body.data.pagination.total >= 1 &&
                body.data.pagination.totalPages >= 1;
            console.log(`   Pagination Metadata Verification: ${hasItems && hasPagination ? 'PASSED' : 'FAILED'}`);
        });
        // 6. 200 Detail (With counts)
        await testCase('6. 200 Detail (With counts)', 'GET', `/api/policies/${customPolicyId}`, null, rootToken, 200, (body) => {
            const hasCounts = body.data.userAttachments !== undefined &&
                body.data.groupAttachments !== undefined;
            console.log(`   Relational Attachment Counts Verification: ${hasCounts ? 'PASSED' : 'FAILED'} (Users: ${body.data.userAttachments}, Groups: ${body.data.groupAttachments})`);
        });
        // 7. 200 Update Policy (PATCH with partial schema)
        const patchPayload = {
            description: 'Updated test description',
            statements: {
                statements: [
                    {
                        Effect: 'Allow',
                        Action: ['reports:Read', 'reports:Update'],
                        Resource: ['*'],
                    },
                ],
            },
        };
        await testCase('7. 200 Update Policy', 'PATCH', `/api/policies/${customPolicyId}`, patchPayload, rootToken, 200);
        // 8. 404 Invalid ID
        await testCase('8. 404 Invalid ID', 'GET', '/api/policies/00000000-0000-0000-0000-000000000000', null, rootToken, 404);
        // Test UUID validation failure before hitting DB
        await testCase('8b. 400 Bad Request (Invalid UUID Parameter)', 'GET', '/api/policies/invalid-uuid-format', null, rootToken, 400);
        // 9. 403 System Policy Update (Error check)
        const systemPatchPayload = {
            description: 'Attempting system overwrite',
        };
        await testCase('9. 403 System Policy Update', 'PATCH', `/api/policies/${readOnlyPolicy.id}`, systemPatchPayload, rootToken, 403);
        // 10. 403 System Policy Delete (Error check)
        await testCase('10. 403 System Policy Delete', 'DELETE', `/api/policies/${readOnlyPolicy.id}`, null, rootToken, 403);
        // 11. 200 Delete Policy
        await testCase('11. 200 Delete Policy', 'DELETE', `/api/policies/${customPolicyId}`, null, rootToken, 200);
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
