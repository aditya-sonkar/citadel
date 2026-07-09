import { z } from 'zod';

// All valid action strings per the assessment spec
const VALID_ACTIONS = [
  // Reports
  'reports:List', 'reports:Read', 'reports:Create', 'reports:Update', 'reports:Delete',
  // Alerts
  'alerts:List', 'alerts:Read', 'alerts:Create', 'alerts:Acknowledge', 'alerts:Delete',
  // Settings
  'settings:Read', 'settings:Update',
  // Audit
  'audit:List', 'audit:Read',
  // IAM - Policies
  'iam:ListPolicies', 'iam:GetPolicy', 'iam:CreatePolicy', 'iam:UpdatePolicy', 'iam:DeletePolicy',
  // IAM - Groups
  'iam:ListGroups', 'iam:GetGroup', 'iam:CreateGroup', 'iam:UpdateGroup', 'iam:DeleteGroup',
  'iam:AddUserToGroup', 'iam:RemoveUserFromGroup', 'iam:AttachGroupPolicy', 'iam:DetachGroupPolicy',
  'iam:PutGroupPolicy', 'iam:DeleteGroupPolicy',
  // IAM - Users
  'iam:ListUsers', 'iam:GetUser', 'iam:DeleteUser', 'iam:AttachUserPolicy', 'iam:DetachUserPolicy',
  'iam:PutUserPolicy', 'iam:DeleteUserPolicy',
  'iam:PutUserBoundary', 'iam:DeleteUserBoundary',
  'iam:GetCredentialReport', 'iam:GetAuditLog',
  // IAM - Evaluate
  'iam:EvaluatePolicy',
] as const;

// Zod v4: z.enum() accepts readonly const tuples directly
const actionEnum = z.enum(VALID_ACTIONS);

// Zod v4: z.nativeEnum() removed — use z.enum() with literal values from the Prisma enum
const policyTypeEnum = z.enum(['MANAGED', 'INLINE']);

export const policyStatementSchema = z.object({
  Sid: z.string().optional(),
  Effect: z.enum(['Allow', 'Deny']),
  // Zod v4: z.array() no longer accepts error-message params as second arg
  Action: z
    .array(actionEnum)
    .min(1, 'Action array must contain at least one action'),
  Resource: z
    .array(z.literal('*'))
    .length(1, 'Resource must be exactly ["*"]'),
});

export const policyDocumentSchema = z.object({
  statements: z.array(policyStatementSchema).min(1, 'Statements array must contain at least one statement').max(100, 'Statements array cannot exceed 100 statements'),
});

export const createPolicySchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Policy name must be at least 3 characters').max(100, 'Policy name cannot exceed 100 characters'),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
    type: policyTypeEnum,
    statements: policyDocumentSchema,
    userId: z.string().uuid('Invalid user UUID format').optional(),
    groupId: z.string().uuid('Invalid group UUID format').optional(),
  }),
});

export const updatePolicySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid UUID format'),
  }),
  body: z.object({
    name: z.string().min(3, 'Policy name must be at least 3 characters').max(100, 'Policy name cannot exceed 100 characters').optional(),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
    type: policyTypeEnum.optional(),
    statements: policyDocumentSchema.optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid UUID format'),
  }),
});

export const listPoliciesQuerySchema = z.object({
  query: z.object({
    page: z.preprocess((val) => (val ? Number(val) : 1), z.number().int().positive()).default(1),
    limit: z.preprocess((val) => (val ? Number(val) : 10), z.number().int().positive().max(100)).default(10),
    search: z.string().optional(),
    sortBy: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
    type: policyTypeEnum.optional(),
  }),
});
