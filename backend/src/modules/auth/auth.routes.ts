import { Router } from 'express';
import { validate } from '../../core/middlewares/validate.middleware';
import { authMiddleware } from '../../core/middlewares/auth.middleware';
import * as authController from './auth.controller';
import { registerSchema, loginSchema, refreshSchema, resetPasswordSchema } from './auth.validator';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshSchema), authController.refresh);
router.post('/logout', validate(refreshSchema), authController.logout);
router.get('/me', authMiddleware, authController.me);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

export default router;
