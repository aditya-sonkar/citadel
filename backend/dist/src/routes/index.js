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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_routes_1 = __importStar(require("../modules/users/user.routes"));
const router = (0, express_1.Router)();
const auth_routes_1 = __importDefault(require("../modules/auth/auth.routes"));
const resources_routes_1 = __importDefault(require("../modules/resources/resources.routes"));
const policy_routes_1 = __importDefault(require("../modules/policies/policy.routes"));
const group_routes_1 = __importDefault(require("../modules/groups/group.routes"));
const audit_routes_1 = __importDefault(require("../modules/audit/audit.routes"));
// Inline health check to avoid importing from empty health.routes
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            status: 'ok',
            timestamp: new Date().toISOString()
        }
    });
});
const evaluate_routes_1 = __importDefault(require("../modules/evaluate/evaluate.routes"));
// Import and mount module routers here as they are implemented
router.use('/api/users', user_routes_1.default);
router.use('/api/auth', auth_routes_1.default);
router.use('/api', resources_routes_1.default);
router.use('/api/iam/policies', policy_routes_1.default);
router.use('/api/iam/groups', group_routes_1.default);
router.use('/api/iam/users', user_routes_1.userIamRouter);
router.use('/api/iam/audit-logs', audit_routes_1.default);
router.use('/api/iam/evaluate', evaluate_routes_1.default);
exports.default = router;
