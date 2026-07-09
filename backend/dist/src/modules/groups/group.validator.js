"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listGroupsQuerySchema = exports.policyDeleteParamSchema = exports.policyAttachmentSchema = exports.memberDeleteParamSchema = exports.memberActionSchema = exports.idParamSchema = exports.updateGroupSchema = exports.createGroupSchema = void 0;
const zod_1 = require("zod");
exports.createGroupSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(3, 'Group name must be at least 3 characters').max(100, 'Group name cannot exceed 100 characters'),
        description: zod_1.z.string().max(500, 'Description cannot exceed 500 characters').optional(),
    }),
});
exports.updateGroupSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid UUID format'),
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(3, 'Group name must be at least 3 characters').max(100, 'Group name cannot exceed 100 characters').optional(),
        description: zod_1.z.string().max(500, 'Description cannot exceed 500 characters').optional(),
    }),
});
exports.idParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid UUID format'),
    }),
});
exports.memberActionSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid UUID format'),
    }),
    body: zod_1.z.object({
        userId: zod_1.z.string().uuid('Invalid userId format'),
    }),
});
exports.memberDeleteParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid group UUID format'),
        userId: zod_1.z.string().uuid('Invalid user UUID format'),
    }),
});
exports.policyAttachmentSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid UUID format'),
    }),
    body: zod_1.z.object({
        policyId: zod_1.z.string().uuid('Invalid policyId format'),
    }),
});
exports.policyDeleteParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid group UUID format'),
        policyId: zod_1.z.string().uuid('Invalid policy UUID format'),
    }),
});
exports.listGroupsQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.preprocess((val) => (val ? Number(val) : 1), zod_1.z.number().int().positive()).default(1),
        limit: zod_1.z.preprocess((val) => (val ? Number(val) : 10), zod_1.z.number().int().positive().max(100)).default(10),
        search: zod_1.z.string().optional(),
        sortBy: zod_1.z.string().optional(),
        order: zod_1.z.enum(['asc', 'desc']).optional(),
    }),
});
