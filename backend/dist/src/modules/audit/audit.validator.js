"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listLogsQuerySchema = exports.idParamSchema = void 0;
const zod_1 = require("zod");
exports.idParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid audit log UUID format'),
    }),
});
exports.listLogsQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.preprocess((val) => (val ? Number(val) : 1), zod_1.z.number().int().positive()).default(1),
        limit: zod_1.z.preprocess((val) => (val ? Number(val) : 10), zod_1.z.number().int().positive().max(100)).default(10),
        search: zod_1.z.string().optional(),
        action: zod_1.z.string().optional(),
        effect: zod_1.z.enum(['Allow', 'Deny']).optional(),
        decision: zod_1.z.enum(['ROOT_BYPASS', 'ALLOW_MATCH', 'EXPLICIT_DENY', 'BOUNDARY_DENY', 'DELEGATION_DENY', 'NO_MATCH']).optional(),
        userId: zod_1.z.string().uuid('Invalid user UUID format').optional(),
        fromDate: zod_1.z.string().datetime({ message: 'Invalid fromDate ISO format' }).optional(),
        toDate: zod_1.z.string().datetime({ message: 'Invalid toDate ISO format' }).optional(),
    }),
});
