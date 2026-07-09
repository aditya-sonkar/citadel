"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsersQuerySchema = exports.policyDeleteParamSchema = exports.policyAttachmentSchema = exports.idParamSchema = void 0;
const zod_1 = require("zod");
exports.idParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid user UUID format'),
    }),
});
exports.policyAttachmentSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid user UUID format'),
    }),
    body: zod_1.z.object({
        policyId: zod_1.z.string().uuid('Invalid policyId format'),
    }),
});
exports.policyDeleteParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid user UUID format'),
        policyId: zod_1.z.string().uuid('Invalid policy UUID format'),
    }),
});
exports.listUsersQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.preprocess((val) => (val ? Number(val) : 1), zod_1.z.number().int().positive()).default(1),
        limit: zod_1.z.preprocess((val) => (val ? Number(val) : 10), zod_1.z.number().int().positive().max(100)).default(10),
        search: zod_1.z.string().optional(),
    }),
});
