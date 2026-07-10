import { Request, Response } from 'express';
import { asyncHandler } from '../../core/utils/asyncHandler';
import * as authService from './auth.service';
import { ApiResponse } from '../../shared/ApiResponse';
import { HTTP_STATUS } from '../../core/utils/constants';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.register(req.body);
  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(true, 'User registered successfully', user));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const requestInfo = {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  };
  const payload = await authService.login(req.body, requestInfo);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(true, 'Login successful', payload));
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const requestInfo = {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  };
  const payload = await authService.refresh(req.body.refreshToken, requestInfo);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(true, 'Tokens rotated successfully', payload));
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  await authService.logout(req.body.refreshToken);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(true, 'Logout successful'));
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  // req.user is guaranteed to be present by authMiddleware
  const userId = req.user!.userId;
  const profile = await authService.getProfile(userId);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(true, 'Profile retrieved successfully', profile));
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email, newPassword } = req.body;
  await authService.resetPassword(email, newPassword);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(true, 'Password reset successfully', null));
});
