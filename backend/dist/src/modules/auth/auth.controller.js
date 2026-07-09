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
exports.me = exports.logout = exports.refresh = exports.login = exports.register = void 0;
const asyncHandler_1 = require("../../core/utils/asyncHandler");
const authService = __importStar(require("./auth.service"));
const ApiResponse_1 = require("../../shared/ApiResponse");
const constants_1 = require("../../core/utils/constants");
exports.register = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await authService.register(req.body);
    res
        .status(constants_1.HTTP_STATUS.CREATED)
        .json(new ApiResponse_1.ApiResponse(true, 'User registered successfully', user));
});
exports.login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const requestInfo = {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
    };
    const payload = await authService.login(req.body, requestInfo);
    res
        .status(constants_1.HTTP_STATUS.OK)
        .json(new ApiResponse_1.ApiResponse(true, 'Login successful', payload));
});
exports.refresh = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const requestInfo = {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
    };
    const payload = await authService.refresh(req.body.refreshToken, requestInfo);
    res
        .status(constants_1.HTTP_STATUS.OK)
        .json(new ApiResponse_1.ApiResponse(true, 'Tokens rotated successfully', payload));
});
exports.logout = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await authService.logout(req.body.refreshToken);
    res
        .status(constants_1.HTTP_STATUS.OK)
        .json(new ApiResponse_1.ApiResponse(true, 'Logout successful'));
});
exports.me = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    // req.user is guaranteed to be present by authMiddleware
    const userId = req.user.userId;
    const profile = await authService.getProfile(userId);
    res
        .status(constants_1.HTTP_STATUS.OK)
        .json(new ApiResponse_1.ApiResponse(true, 'Profile retrieved successfully', profile));
});
