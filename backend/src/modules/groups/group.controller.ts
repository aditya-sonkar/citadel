import { Request, Response } from 'express';
import * as groupService from './group.service';
import { ApiResponse } from '../../shared/ApiResponse';
import { HTTP_STATUS } from '../../core/utils/constants';
import { asyncHandler } from '../../core/utils/asyncHandler';

export const createGroup = asyncHandler(async (req: Request, res: Response) => {
  const group = await groupService.createGroup(req.body, req.user!.userId);
  res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(true, 'Group created successfully', group)
  );
});

export const getGroup = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const group = await groupService.getGroupById(id);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(true, 'Group details fetched successfully', group)
  );
});

export const listGroups = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = req.query.search as string | undefined;
  const sortBy = req.query.sortBy as string | undefined;
  const order = req.query.order as 'asc' | 'desc' | undefined;

  const skip = (page - 1) * limit;
  const take = limit;

  const { items, total } = await groupService.listGroups({
    skip,
    take,
    search,
    sortBy,
    order,
  });

  const totalPages = Math.ceil(total / limit);

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(true, 'Groups fetched successfully', {
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

export const updateGroup = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const group = await groupService.updateGroup(id, req.body, req.user!.userId);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(true, 'Group updated successfully', group)
  );
});

export const deleteGroup = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await groupService.deleteGroup(id, req.user!.userId);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(true, 'Group deleted successfully', null)
  );
});

export const addMember = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { userId } = req.body;
  const membership = await groupService.addMember(id, userId, req.user!.userId);
  res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(true, 'User added to group successfully', membership)
  );
});

export const removeMember = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.params.userId as string;
  await groupService.removeMember(id, userId, req.user!.userId);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(true, 'User removed from group successfully', null)
  );
});

export const attachPolicy = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { policyId } = req.body;
  const callerUserId = req.user!.userId;
  const attachment = await groupService.attachPolicy(id, policyId, callerUserId);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(true, 'Policy attached to group successfully', attachment)
  );
});

export const detachPolicy = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const policyId = req.params.policyId as string;
  await groupService.detachPolicy(id, policyId, req.user!.userId);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(true, 'Policy detached from group successfully', null)
  );
});

export const putGroupPolicy = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const policyName = req.params.policyName as string;
  const callerUserId = req.user!.userId;
  const policy = await groupService.putGroupPolicy(id, policyName, req.body, callerUserId);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(true, 'Group inline policy put successfully', policy)
  );
});

export const deleteGroupPolicy = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const policyName = req.params.policyName as string;
  const callerUserId = req.user!.userId;
  await groupService.deleteGroupPolicy(id, policyName, callerUserId);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(true, 'Group inline policy deleted successfully', null)
  );
});
