import { Request, Response } from 'express';
import { asyncHandler } from '../../core/utils/asyncHandler';
import * as userService from './user.service';
import { ApiResponse } from '../../shared/ApiResponse';
import { HTTP_STATUS } from '../../core/utils/constants';

// --- Standard User profile handlers ---

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const profile = await userService.getUserProfile(userId);

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(true, 'Profile retrieved successfully', profile));
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const profile = await userService.UpdateUserProfile(userId, req.body);

  res.status(HTTP_STATUS.OK)
    .json(new ApiResponse(true, 'Profile updated successfully', profile));
});

// --- User IAM Administration handlers ---

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = req.query.search as string | undefined;

  const skip = (page - 1) * limit;
  const take = limit;

  const { items, total } = await userService.listUsers({
    skip,
    take,
    search,
  });

  const totalPages = Math.ceil(total / limit);

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(true, 'Users fetched successfully', {
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

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const user = await userService.getUserById(id);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(true, 'User details fetched successfully', user)
  );
});

export const attachPolicy = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { policyId } = req.body;
  const callerUserId = req.user!.userId;
  const attachment = await userService.attachPolicy(id, policyId, callerUserId);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(true, 'Policy attached to user successfully', attachment)
  );
});

export const detachPolicy = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const policyId = req.params.policyId as string;
  const callerUserId = req.user!.userId;
  await userService.detachPolicy(id, policyId, callerUserId);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(true, 'Policy detached from user successfully', null)
  );
});

export const putBoundary = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { policyId } = req.body;
  const callerUserId = req.user!.userId;
  const boundary = await userService.putBoundary(id, policyId, callerUserId);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(true, 'Permissions Boundary set successfully', boundary)
  );
});

export const deleteBoundary = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const callerUserId = req.user!.userId;
  await userService.deleteBoundary(id, callerUserId);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(true, 'Permissions Boundary deleted successfully', null)
  );
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await userService.deleteUser(id);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(true, 'User deleted successfully', null)
  );
});

export const getCredentialReport = asyncHandler(async (req: Request, res: Response) => {
  const report = await userService.getCredentialReport();
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(true, 'Credential report generated successfully', report)
  );
});

export const putUserPolicy = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const policyName = req.params.policyName as string;
  const callerUserId = req.user!.userId;
  const policy = await userService.putUserPolicy(id, policyName, req.body, callerUserId);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(true, 'User inline policy put successfully', policy)
  );
});

export const deleteUserPolicy = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const policyName = req.params.policyName as string;
  const callerUserId = req.user!.userId;
  await userService.deleteUserPolicy(id, policyName, callerUserId);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(true, 'User inline policy deleted successfully', null)
  );
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { currentPassword, newPassword } = req.body;
  await userService.changePassword(userId, currentPassword, newPassword);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(true, 'Password updated successfully', null)
  );
});