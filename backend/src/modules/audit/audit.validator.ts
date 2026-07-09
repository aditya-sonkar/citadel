import { z } from 'zod';

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid audit log UUID format'),
  }),
});

export const listLogsQuerySchema = z.object({
  query: z.object({
    page: z.preprocess((val) => (val ? Number(val) : 1), z.number().int().positive()).default(1),
    limit: z.preprocess((val) => (val ? Number(val) : 10), z.number().int().positive().max(100)).default(10),
    search: z.string().optional(),
    action: z.string().optional(),
    effect: z.enum(['Allow', 'Deny']).optional(),
    decision: z.enum(['ROOT_BYPASS', 'ALLOW_MATCH', 'EXPLICIT_DENY', 'BOUNDARY_DENY', 'DELEGATION_DENY', 'NO_MATCH']).optional(),
    userId: z.string().uuid('Invalid user UUID format').optional(),
    fromDate: z.string().datetime({ message: 'Invalid fromDate ISO format' }).optional(),
    toDate: z.string().datetime({ message: 'Invalid toDate ISO format' }).optional(),
  }),
});
