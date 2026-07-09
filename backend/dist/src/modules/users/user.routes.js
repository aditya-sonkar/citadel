"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.userIamRouter = void 0;
const express_1 = require("express");
const validate_middleware_1 = require("../../core/middlewares/validate.middleware");
const auth_middleware_1 = require("../../core/middlewares/auth.middleware");
const authorize_middleware_1 = require("../../core/middlewares/authorize.middleware");
const userController = __importStar(require("./user.controller"));
const iam_constants_1 = require("../../iam/iam.constants");
const user_validator_1 = require("./user.validator");
const router = (0, express_1.Router)();
// --- Standard User routes ---
router.get('/me', auth_middleware_1.authMiddleware, userController.getProfile);
router.put('/me', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)(user_validator_1.updateProfileSchema), userController.updateProfile);
exports.default = router;
// --- User IAM administration routes ---
exports.userIamRouter = (0, express_1.Router)();
// 0. GET /credential-report -> Get credential report
exports.userIamRouter.get('/credential-report', auth_middleware_1.authMiddleware, (0, authorize_middleware_1.authorize)(iam_constants_1.IAM_ACTIONS.GET_CREDENTIAL_REPORT), userController.getCredentialReport);
// 1. GET / -> List users
exports.userIamRouter.get('/', auth_middleware_1.authMiddleware, (0, authorize_middleware_1.authorize)(iam_constants_1.IAM_ACTIONS.LIST_USERS), (0, validate_middleware_1.validate)(user_validator_1.listUsersQuerySchema), userController.listUsers);
// 2. GET /:id -> Get user details
exports.userIamRouter.get('/:id', auth_middleware_1.authMiddleware, (0, authorize_middleware_1.authorize)(iam_constants_1.IAM_ACTIONS.GET_USER), (0, validate_middleware_1.validate)(user_validator_1.idParamSchema), userController.getUser);
// 3. POST /:id/policies -> Attach direct policy to user
exports.userIamRouter.post('/:id/policies', auth_middleware_1.authMiddleware, (0, authorize_middleware_1.authorize)(iam_constants_1.IAM_ACTIONS.ATTACH_USER_POLICY), (0, validate_middleware_1.validate)(user_validator_1.policyAttachmentSchema), userController.attachPolicy);
// 4. DELETE /:id/policies/:policyId -> Detach policy from user
exports.userIamRouter.delete('/:id/policies/:policyId', auth_middleware_1.authMiddleware, (0, authorize_middleware_1.authorize)(iam_constants_1.IAM_ACTIONS.DETACH_USER_POLICY), (0, validate_middleware_1.validate)(user_validator_1.policyDeleteParamSchema), userController.detachPolicy);
// 5. PUT /:id/boundary -> Put user Permissions Boundary
exports.userIamRouter.put('/:id/boundary', auth_middleware_1.authMiddleware, (0, authorize_middleware_1.authorize)(iam_constants_1.IAM_ACTIONS.PUT_USER_BOUNDARY), (0, validate_middleware_1.validate)(user_validator_1.policyAttachmentSchema), userController.putBoundary);
// 6. DELETE /:id/boundary -> Delete user Permissions Boundary
exports.userIamRouter.delete('/:id/boundary', auth_middleware_1.authMiddleware, (0, authorize_middleware_1.authorize)(iam_constants_1.IAM_ACTIONS.DELETE_USER_BOUNDARY), (0, validate_middleware_1.validate)(user_validator_1.idParamSchema), userController.deleteBoundary);
// 7. DELETE /:id -> Delete user
exports.userIamRouter.delete('/:id', auth_middleware_1.authMiddleware, (0, authorize_middleware_1.authorize)(iam_constants_1.IAM_ACTIONS.DELETE_USER), (0, validate_middleware_1.validate)(user_validator_1.idParamSchema), userController.deleteUser);
