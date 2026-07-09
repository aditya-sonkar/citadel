import { z } from 'zod';
import { policyDocumentSchema } from '../policies/policy.validator';

export const createGroupSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Group name must be at least 3 characters').max(100, 'Group name cannot exceed 100 characters'),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  }),
});

export const updateGroupSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid UUID format'),
  }),
  body: z.object({
    name: z.string().min(3, 'Group name must be at least 3 characters').max(100, 'Group name cannot exceed 100 characters').optional(),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid UUID format'),
  }),
});

export const memberActionSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid UUID format'),
  }),
  body: z.object({
    userId: z.string().uuid('Invalid userId format'),
  }),
});

export const memberDeleteParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid group UUID format'),
    userId: z.string().uuid('Invalid user UUID format'),
  }),
});

export const policyAttachmentSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid UUID format'),
  }),
  body: z.object({
    policyId: z.string().uuid('Invalid policyId format'),
  }),
});

export const policyDeleteParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid group UUID format'),
    policyId: z.string().uuid('Invalid policy UUID format'),
  }),
});

export const listGroupsQuerySchema = z.object({
  query: z.object({
    page: z.preprocess((val) => (val ? Number(val) : 1), z.number().int().positive()).default(1),
    limit: z.preprocess((val) => (val ? Number(val) : 10), z.number().int().positive().max(100)).default(10),
    search: z.string().optional(),
    sortBy: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
  }),
});

export const putGroupPolicySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid group UUID format'),
    policyName: z.string().min(3, 'Policy name must be at least 3 characters').max(100, 'Policy name cannot exceed 100 characters').regex(/^[\w\s+=,.@\-]+$/, 'Policy name can only contain alphanumeric characters, spaces, and +=,.@-_'),
  }),
  body: policyDocumentSchema,
});

export const deleteGroupPolicySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid group UUID format'),
    policyName: z.string().min(3, 'Policy name must be at least 3 characters').max(100, 'Policy name cannot exceed 100 characters').regex(/^[\w\s+=,.@\-]+$/, 'Policy name can only contain alphanumeric characters, spaces, and +=,.@-_'),
  }),
});
