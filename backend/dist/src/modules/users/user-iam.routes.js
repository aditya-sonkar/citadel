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
const express_1 = require("express");
const auth_middleware_1 = require("../../core/middlewares/auth.middleware");
const authorize_middleware_1 = require("../../core/middlewares/authorize.middleware");
const validate_middleware_1 = require("../../core/middlewares/validate.middleware");
const userIamController = __importStar(require("./user-iam.controller"));
const user_iam_validator_1 = require("./user-iam.validator");
const router = (0, express_1.Router)();
// 1. GET / -> List users
router.get('/', auth_middleware_1.authMiddleware, (0, authorize_middleware_1.authorize)('iam:ListUsers'), (0, validate_middleware_1.validate)(user_iam_validator_1.listUsersQuerySchema), userIamController.listUsers);
// 2. GET /:id -> Get user detail details
router.get('/:id', auth_middleware_1.authMiddleware, (0, authorize_middleware_1.authorize)('iam:GetUser'), (0, validate_middleware_1.validate)(user_iam_validator_1.idParamSchema), userIamController.getUser);
// 3. GET /:id/resolved-statements -> Get resolved statements
router.get('/:id/resolved-statements', auth_middleware_1.authMiddleware, (0, authorize_middleware_1.authorize)('iam:GetResolvedStatements'), (0, validate_middleware_1.validate)(user_iam_validator_1.idParamSchema), userIamController.getResolvedStatements);
// 4. GET /:id/effective-access -> Get effective access summary
router.get('/:id/effective-access', auth_middleware_1.authMiddleware, (0, authorize_middleware_1.authorize)('iam:GetEffectiveAccess'), (0, validate_middleware_1.validate)(user_iam_validator_1.idParamSchema), userIamController.getEffectiveAccess);
// 5. POST /:id/policies -> Attach direct policy to user
router.post('/:id/policies', auth_middleware_1.authMiddleware, (0, authorize_middleware_1.authorize)('iam:AttachUserPolicy'), (0, validate_middleware_1.validate)(user_iam_validator_1.policyAttachmentSchema), userIamController.attachPolicy);
// 6. DELETE /:id/policies/:policyId -> Detach policy from user
router.delete('/:id/policies/:policyId', auth_middleware_1.authMiddleware, (0, authorize_middleware_1.authorize)('iam:DetachUserPolicy'), (0, validate_middleware_1.validate)(user_iam_validator_1.policyDeleteParamSchema), userIamController.detachPolicy);
// 7. PUT /:id/boundary -> Put user Permissions Boundary
router.put('/:id/boundary', auth_middleware_1.authMiddleware, (0, authorize_middleware_1.authorize)('iam:PutUserPermissionsBoundary'), (0, validate_middleware_1.validate)(user_iam_validator_1.policyAttachmentSchema), userIamController.putBoundary);
// 8. DELETE /:id/boundary -> Delete user Permissions Boundary
router.delete('/:id/boundary', auth_middleware_1.authMiddleware, (0, authorize_middleware_1.authorize)('iam:DeleteUserPermissionsBoundary'), (0, validate_middleware_1.validate)(user_iam_validator_1.idParamSchema), userIamController.deleteBoundary);
exports.default = router;
