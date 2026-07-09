import { Request, Response } from 'express';
import * as auditService from './audit.service';
import { ApiResponse } from '../../shared/ApiResponse';
import { HTTP_STATUS } from '../../core/utils/constants';
import { asyncHandler } from '../../core/utils/asyncHandler';
import { AuditEffect, AuditDecision } from '@prisma/client';
import { ApiError } from '../../shared/ApiError';

export const listLogs = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = req.query.search as string | undefined;
  const action = req.query.action as string | undefined;
  const effect = req.query.effect as AuditEffect | undefined;
  const decision = req.query.decision as AuditDecision | undefined;
  const userId = req.query.userId as string | undefined;

  let fromDate: Date | undefined;
  let toDate: Date | undefined;

  if (req.query.fromDate) {
    fromDate = new Date(req.query.fromDate as string);
  }
  if (req.query.toDate) {
    toDate = new Date(req.query.toDate as string);
  }

  const skip = (page - 1) * limit;
  const take = limit;

  const { items, total } = await auditService.listLogs({
    skip,
    take,
    search,
    action,
    effect,
    decision,
    userId,
    fromDate,
    toDate,
  });

  const totalPages = Math.ceil(total / limit);

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(true, 'Audit logs fetched successfully', {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    })
  );
});

export const getLog = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const log = await auditService.getLogById(id);

  if (!log) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Audit log not found');
  }

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(true, 'Audit log details fetched successfully', log)
  );
});
