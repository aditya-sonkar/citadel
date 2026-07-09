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
const auditController = __importStar(require("./audit.controller"));
const iam_constants_1 = require("../../iam/iam.constants");
const audit_validator_1 = require("./audit.validator");
const router = (0, express_1.Router)();
// 1. GET / -> List audit logs
router.get('/', auth_middleware_1.authMiddleware, (0, authorize_middleware_1.authorize)(iam_constants_1.IAM_ACTIONS.LIST_AUDIT_LOGS), (0, validate_middleware_1.validate)(audit_validator_1.listLogsQuerySchema), auditController.listLogs);
// 2. GET /:id -> Get audit log detail
router.get('/:id', auth_middleware_1.authMiddleware, (0, authorize_middleware_1.authorize)(iam_constants_1.IAM_ACTIONS.GET_AUDIT_LOG), (0, validate_middleware_1.validate)(audit_validator_1.idParamSchema), auditController.getLog);
exports.default = router;
