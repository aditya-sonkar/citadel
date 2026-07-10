import { Request, Response } from 'express';
import * as settingsService from './settings.service';
import { ApiResponse } from '../../shared/ApiResponse';
import { HTTP_STATUS } from '../../core/utils/constants';

/**
 * Reusable dummy controller for IAM testing.
 * Returns { success: true, message: "OK" } for all authorized requests.
 */
export const ok = (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'OK'
  });
};

export const getSettings = (req: Request, res: Response) => {
  const settings = settingsService.getSettings();
  res.status(HTTP_STATUS.OK).json(new ApiResponse(true, 'Settings retrieved successfully', settings));
};

export const updateSettings = (req: Request, res: Response) => {
  const settings = settingsService.saveSettings(req.body);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(true, 'Settings updated successfully', settings));
};
