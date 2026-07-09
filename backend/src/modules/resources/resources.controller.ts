import { Request, Response } from 'express';

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
