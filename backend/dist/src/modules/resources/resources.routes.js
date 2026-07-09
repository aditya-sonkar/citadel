"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../core/middlewares/auth.middleware");
const authorize_middleware_1 = require("../../core/middlewares/authorize.middleware");
const resources_controller_1 = require("./resources.controller");
const router = (0, express_1.Router)();
// --- Resource: reports ---
router.get('/reports', auth_middleware_1.authMiddleware, (0, authorize_middleware_1.authorize)('reports:List'), resources_controller_1.ok);
router.get('/reports/:id', auth_middleware_1.authMiddleware, (0, authorize_middleware_1.authorize)('reports:Read'), resources_controller_1.ok);
router.post('/reports', auth_middleware_1.authMiddleware, (0, authorize_middleware_1.authorize)('reports:Create'), resources_controller_1.ok);
router.put('/reports/:id', auth_middleware_1.authMiddleware, (0, authorize_middleware_1.authorize)('reports:Update'), resources_controller_1.ok);
router.delete('/reports/:id', auth_middleware_1.authMiddleware, (0, authorize_middleware_1.authorize)('reports:Delete'), resources_controller_1.ok);
// --- Resource: alerts ---
router.get('/alerts', auth_middleware_1.authMiddleware, (0, authorize_middleware_1.authorize)('alerts:List'), resources_controller_1.ok);
router.get('/alerts/:id', auth_middleware_1.authMiddleware, (0, authorize_middleware_1.authorize)('alerts:Read'), resources_controller_1.ok);
router.post('/alerts', auth_middleware_1.authMiddleware, (0, authorize_middleware_1.authorize)('alerts:Create'), resources_controller_1.ok);
router.patch('/alerts/:id/acknowledge', auth_middleware_1.authMiddleware, (0, authorize_middleware_1.authorize)('alerts:Acknowledge'), resources_controller_1.ok);
router.delete('/alerts/:id', auth_middleware_1.authMiddleware, (0, authorize_middleware_1.authorize)('alerts:Delete'), resources_controller_1.ok);
// --- Resource: settings ---
router.get('/settings', auth_middleware_1.authMiddleware, (0, authorize_middleware_1.authorize)('settings:Read'), resources_controller_1.ok);
router.put('/settings', auth_middleware_1.authMiddleware, (0, authorize_middleware_1.authorize)('settings:Update'), resources_controller_1.ok);
// --- Resource: audit ---
router.get('/audit', auth_middleware_1.authMiddleware, (0, authorize_middleware_1.authorize)('audit:List'), resources_controller_1.ok);
router.get('/audit/:id', auth_middleware_1.authMiddleware, (0, authorize_middleware_1.authorize)('audit:Read'), resources_controller_1.ok);
exports.default = router;
