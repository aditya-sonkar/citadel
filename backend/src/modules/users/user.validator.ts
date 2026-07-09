import { z } from 'zod';
import { policyDocumentSchema } from '../policies/policy.validator';

// Schema to validate user profile
export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  }),
});

// Schema to validate admin user creation
export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  }),
});

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user UUID format'),
  }),
});

export const policyAttachmentSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user UUID format'),
  }),
  body: z.object({
    policyId: z.string().uuid('Invalid policyId format'),
  }),
});

export const policyDeleteParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user UUID format'),
    policyId: z.string().uuid('Invalid policy UUID format'),
  }),
});

export const listUsersQuerySchema = z.object({
  query: z.object({
    page: z.preprocess((val) => (val ? Number(val) : 1), z.number().int().positive()).default(1),
    limit: z.preprocess((val) => (val ? Number(val) : 10), z.number().int().positive().max(100)).default(10),
    search: z.string().optional(),
  }),
});

export const putUserPolicySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user UUID format'),
    policyName: z.string().min(3, 'Policy name must be at least 3 characters').max(100, 'Policy name cannot exceed 100 characters').regex(/^[\w\s+=,.@\-]+$/, 'Policy name can only contain alphanumeric characters, spaces, and +=,.@-_'),
  }),
  body: policyDocumentSchema,
});

export const deleteUserPolicySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user UUID format'),
    policyName: z.string().min(3, 'Policy name must be at least 3 characters').max(100, 'Policy name cannot exceed 100 characters').regex(/^[\w\s+=,.@\-]+$/, 'Policy name can only contain alphanumeric characters, spaces, and +=,.@-_'),
  }),
});