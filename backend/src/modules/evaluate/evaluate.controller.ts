import { Request, Response } from 'express';
import { asyncHandler } from '../../core/utils/asyncHandler';
import { ApiResponse } from '../../shared/ApiResponse';
import { HTTP_STATUS } from '../../core/utils/constants';
import { permissionEngine } from '../../iam/permission-engine';
import * as auditService from '../audit/audit.service';
import { AuditEffect, AuditDecision } from '@prisma/client';

export const evaluateAccess = asyncHandler(async (req: Request, res: Response) => {
  const { action, resource, userId } = req.body;
  const callerUserId = req.user!.userId;

  if (!action || !resource || !userId) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      new ApiResponse(false, 'Missing required fields: action, resource, userId', null)
    );
  }

  // Run the IAM engine
  const evaluation = await permissionEngine.hasPermission(userId, action, resource);

  // Construct evaluation path
  const evaluationPath: string[] = [];
  
  if (evaluation.reason === 'ROOT_BYPASS') {
    evaluationPath.push('User is root - Bypass all evaluation');
  } else if (evaluation.reason === 'NO_MATCH') {
    evaluationPath.push('Check explicit deny (0 matched)');
    evaluationPath.push('Check explicit allow (0 matched)');
    evaluationPath.push('Default Deny');
  } else if (evaluation.reason === 'EXPLICIT_DENY') {
    evaluationPath.push('Check explicit deny');
    evaluationPath.push(`Deny matched in policy: ${evaluation.matchedPolicyNames?.[0]}`);
  } else if (evaluation.reason === 'ALLOW_MATCH') {
    evaluationPath.push('Check explicit deny (0 matched)');
    evaluationPath.push('Check explicit allow');
    evaluationPath.push(`Allow matched in policy: ${evaluation.matchedPolicyNames?.join(', ')}`);
    evaluationPath.push('Check permission boundary (passed or not set)');
  } else if (evaluation.reason === 'BOUNDARY_DENY') {
    evaluationPath.push('Check explicit deny (0 matched)');
    evaluationPath.push('Check explicit allow');
    evaluationPath.push(`Allow matched in policy: ${evaluation.matchedPolicyNames?.join(', ')}`);
    evaluationPath.push('Check permission boundary');
    evaluationPath.push('Boundary Deny (action not allowed by boundary)');
  }

  // Determine effect and decision for audit
  const effect: AuditEffect = evaluation.allowed ? AuditEffect.Allow : AuditEffect.Deny;

  const decision: AuditDecision = evaluation.reason as AuditDecision;

  // Log to Audit table
  auditService.log({
    userId,
    action,
    targetResource: resource,
    effect,
    decision,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    metadata: {
      callerUserId,
      matchedPolicyIds: evaluation.matchedPolicyIds,
      matchedPolicyNames: evaluation.matchedPolicyNames,
    }
  });

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(true, 'Evaluation complete', {
      decision: evaluation.reason,
      matchedPolicy: evaluation.matchedPolicyNames?.[0],
      evaluationPath,
      reason: evaluation.reason === 'ALLOW_MATCH' ? 'Action explicitly allowed by attached policy.' : 
              evaluation.reason === 'ROOT_BYPASS' ? 'Action allowed because user has root privileges.' :
              evaluation.reason === 'EXPLICIT_DENY' ? 'Action explicitly denied by an attached policy.' :
              evaluation.reason === 'BOUNDARY_DENY' ? 'Action allowed by identity policy but denied by permission boundary.' :
              'Action implicitly denied because no policy explicitly allows it.',
    })
  );
});

import { getUserPermissions } from '../policies/authorization.repository';

export const evaluateBatch = asyncHandler(async (req: Request, res: Response) => {
  const { actions, resource, userId } = req.body;
  const callerUserId = req.user!.userId;

  if (!actions || !Array.isArray(actions) || !resource || !userId) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      new ApiResponse(false, 'Missing required fields: actions array, resource, userId', null)
    );
  }

  // Pre-load user permissions ONCE for the entire batch
  const preloadedData = await getUserPermissions(userId);

  if (!preloadedData) {
    return res.status(HTTP_STATUS.NOT_FOUND).json(
      new ApiResponse(false, 'User not found', null)
    );
  }

  const results: Record<string, any> = {};

  for (const action of actions) {
    const evaluation = await permissionEngine.hasPermission(userId, action, resource, preloadedData);
    
    // We intentionally skip audit logging for batch evaluate as it's meant for UI read-only previews.
    
    const isAllowed = evaluation.reason === 'ALLOW_MATCH' || evaluation.reason === 'ROOT_BYPASS';
    let reasonText = 'Implicitly Denied';
    if (evaluation.reason === 'ROOT_BYPASS') {
      reasonText = 'Allowed (Root Bypass)';
    } else if (evaluation.reason === 'ALLOW_MATCH') {
      reasonText = `Allowed`;
    } else if (evaluation.reason === 'EXPLICIT_DENY') {
      reasonText = 'Explicitly Denied';
    } else if (evaluation.reason === 'BOUNDARY_DENY') {
      reasonText = 'Boundary Blocked';
    }

    results[action] = {
      allowed: isAllowed,
      reason: reasonText,
      source: evaluation.matchedPolicyNames?.[0] || undefined
    };
  }

  res.status(HTTP_STATUS.OK).json(new ApiResponse(true, 'Batch evaluation complete', results));
});
