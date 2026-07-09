"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPoliciesQuerySchema = exports.idParamSchema = exports.updatePolicySchema = exports.createPolicySchema = exports.policyDocumentSchema = exports.policyStatementSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.policyStatementSchema = zod_1.z.object({
    Sid: zod_1.z.string().optional(),
    Effect: zod_1.z.enum(['Allow', 'Deny']),
    Action: zod_1.z.array(zod_1.z.string().min(1)).min(1, 'Action array must contain at least one action'),
    Resource: zod_1.z.array(zod_1.z.string().min(1)).min(1, 'Resource array must contain at least one resource'),
});
exports.policyDocumentSchema = zod_1.z.object({
    statements: zod_1.z.array(exports.policyStatementSchema).min(1, 'Statements array must contain at least one statement').max(100, 'Statements array cannot exceed 100 statements'),
});
exports.createPolicySchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(3, 'Policy name must be at least 3 characters').max(100, 'Policy name cannot exceed 100 characters'),
        description: zod_1.z.string().max(500, 'Description cannot exceed 500 characters').optional(),
        type: zod_1.z.nativeEnum(client_1.PolicyType),
        statements: exports.policyDocumentSchema,
    }),
});
exports.updatePolicySchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid UUID format'),
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(3, 'Policy name must be at least 3 characters').max(100, 'Policy name cannot exceed 100 characters').optional(),
        description: zod_1.z.string().max(500, 'Description cannot exceed 500 characters').optional(),
        type: zod_1.z.nativeEnum(client_1.PolicyType).optional(),
        statements: exports.policyDocumentSchema.optional(),
    }),
});
exports.idParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid UUID format'),
    }),
});
exports.listPoliciesQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.preprocess((val) => (val ? Number(val) : 1), zod_1.z.number().int().positive()).default(1),
        limit: zod_1.z.preprocess((val) => (val ? Number(val) : 10), zod_1.z.number().int().positive().max(100)).default(10),
        search: zod_1.z.string().optional(),
        sortBy: zod_1.z.string().optional(),
        order: zod_1.z.enum(['asc', 'desc']).optional(),
    }),
});
