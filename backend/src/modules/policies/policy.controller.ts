import { Request, Response } from 'express';
import * as policyService from './policy.service';
import { ApiResponse } from '../../shared/ApiResponse';
import { HTTP_STATUS } from '../../core/utils/constants';
import { asyncHandler } from '../../core/utils/asyncHandler';

export const createPolicy = asyncHandler(async (req: Request, res: Response) => {
  const policy = await policyService.createPolicy(req.body, req.user!.userId);
  res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(true, 'Policy created successfully', policy)
  );
});

export const getPolicy = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const policy = await policyService.getPolicyById(id);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(true, 'Policy details fetched successfully', policy)
  );
});

export const listPolicies = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = req.query.search as string | undefined;
  const sortBy = req.query.sortBy as string | undefined;
  const order = req.query.order as 'asc' | 'desc' | undefined;
  const type = req.query.type as any;

  const skip = (page - 1) * limit;
  const take = limit;

  const { items, total } = await policyService.listPolicies({
    skip,
    take,
    search,
    sortBy,
    order,
    type,
  });

  const totalPages = Math.ceil(total / limit);

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(true, 'Policies fetched successfully', {
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

export const updatePolicy = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const policy = await policyService.updatePolicy(id, req.body, req.user!.userId);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(true, 'Policy updated successfully', policy)
  );
});

export const deletePolicy = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await policyService.deletePolicy(id, req.user!.userId);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(true, 'Policy deleted successfully', null)
  );
});
