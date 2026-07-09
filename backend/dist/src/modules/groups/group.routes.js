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
const groupController = __importStar(require("./group.controller"));
const iam_constants_1 = require("../../iam/iam.constants");
const group_validator_1 = require("./group.validator");
const router = (0, express_1.Router)();
// 1. POST / -> Create group
router.post('/', auth_middleware_1.authMiddleware, (0, authorize_middleware_1.authorize)(iam_constants_1.IAM_ACTIONS.CREATE_GROUP), (0, validate_middleware_1.validate)(group_validator_1.createGroupSchema), groupController.createGroup);
// 2. GET / -> List groups
router.get('/', auth_middleware_1.authMiddleware, (0, authorize_middleware_1.authorize)(iam_constants_1.IAM_ACTIONS.LIST_GROUPS), (0, validate_middleware_1.validate)(group_validator_1.listGroupsQuerySchema), groupController.listGroups);
// 3. GET /:id -> Get group detail
router.get('/:id', auth_middleware_1.authMiddleware, (0, authorize_middleware_1.authorize)(iam_constants_1.IAM_ACTIONS.GET_GROUP), (0, validate_middleware_1.validate)(group_validator_1.idParamSchema), groupController.getGroup);
// 4. PATCH /:id -> Update group details
router.patch('/:id', auth_middleware_1.authMiddleware, (0, authorize_middleware_1.authorize)(iam_constants_1.IAM_ACTIONS.UPDATE_GROUP), (0, validate_middleware_1.validate)(group_validator_1.updateGroupSchema), groupController.updateGroup);
// 5. DELETE /:id -> Delete group
router.delete('/:id', auth_middleware_1.authMiddleware, (0, authorize_middleware_1.authorize)(iam_constants_1.IAM_ACTIONS.DELETE_GROUP), (0, validate_middleware_1.validate)(group_validator_1.idParamSchema), groupController.deleteGroup);
// 6. POST /:id/members -> Add user to group
router.post('/:id/members', auth_middleware_1.authMiddleware, (0, authorize_middleware_1.authorize)(iam_constants_1.IAM_ACTIONS.ADD_USER_TO_GROUP), (0, validate_middleware_1.validate)(group_validator_1.memberActionSchema), groupController.addMember);
// 7. DELETE /:id/members/:userId -> Remove user from group
router.delete('/:id/members/:userId', auth_middleware_1.authMiddleware, (0, authorize_middleware_1.authorize)(iam_constants_1.IAM_ACTIONS.REMOVE_USER_FROM_GROUP), (0, validate_middleware_1.validate)(group_validator_1.memberDeleteParamSchema), groupController.removeMember);
// 8. POST /:id/policies -> Attach policy to group
router.post('/:id/policies', auth_middleware_1.authMiddleware, (0, authorize_middleware_1.authorize)(iam_constants_1.IAM_ACTIONS.ATTACH_GROUP_POLICY), (0, validate_middleware_1.validate)(group_validator_1.policyAttachmentSchema), groupController.attachPolicy);
// 9. DELETE /:id/policies/:policyId -> Detach policy from group
router.delete('/:id/policies/:policyId', auth_middleware_1.authMiddleware, (0, authorize_middleware_1.authorize)(iam_constants_1.IAM_ACTIONS.DETACH_GROUP_POLICY), (0, validate_middleware_1.validate)(group_validator_1.policyDeleteParamSchema), groupController.detachPolicy);
exports.default = router;
