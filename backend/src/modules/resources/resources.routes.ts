import { Router } from 'express';
import { authMiddleware } from '../../core/middlewares/auth.middleware';
import { authorize } from '../../core/middlewares/authorize.middleware';
import { ok, getSettings, updateSettings } from './resources.controller';

const router = Router();

// --- Resource: reports ---
router.get('/reports', authMiddleware, authorize('reports:List'), ok);
router.get('/reports/:id', authMiddleware, authorize('reports:Read'), ok);
router.post('/reports', authMiddleware, authorize('reports:Create'), ok);
router.put('/reports/:id', authMiddleware, authorize('reports:Update'), ok);
router.delete('/reports/:id', authMiddleware, authorize('reports:Delete'), ok);

// --- Resource: alerts ---
router.get('/alerts', authMiddleware, authorize('alerts:List'), ok);
router.get('/alerts/:id', authMiddleware, authorize('alerts:Read'), ok);
router.post('/alerts', authMiddleware, authorize('alerts:Create'), ok);
router.patch('/alerts/:id/acknowledge', authMiddleware, authorize('alerts:Acknowledge'), ok);
router.delete('/alerts/:id', authMiddleware, authorize('alerts:Delete'), ok);

// --- Resource: settings ---
router.get('/settings', authMiddleware, authorize('settings:Read'), getSettings);
router.put('/settings', authMiddleware, authorize('settings:Update'), updateSettings);

// --- Resource: audit ---
router.get('/audit', authMiddleware, authorize('audit:List'), ok);
router.get('/audit/:id', authMiddleware, authorize('audit:Read'), ok);

export default router;
