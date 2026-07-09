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
exports.getCredentialReport = exports.deleteUser = exports.deleteBoundary = exports.putBoundary = exports.detachPolicy = exports.attachPolicy = exports.getUser = exports.listUsers = exports.updateProfile = exports.getProfile = void 0;
const asyncHandler_1 = require("../../core/utils/asyncHandler");
const userService = __importStar(require("./user.service"));
const ApiResponse_1 = require("../../shared/ApiResponse");
const constants_1 = require("../../core/utils/constants");
// --- Standard User profile handlers ---
exports.getProfile = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.userId;
    const profile = await userService.getUserProfile(userId);
    res
        .status(constants_1.HTTP_STATUS.OK)
        .json(new ApiResponse_1.ApiResponse(true, 'Profile retrieved successfully', profile));
});
exports.updateProfile = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.userId;
    const profile = await userService.UpdateUserProfile(userId, req.body);
    res.status(constants_1.HTTP_STATUS.OK)
        .json(new ApiResponse_1.ApiResponse(true, 'Profile updated successfully', profile));
});
// --- User IAM Administration handlers ---
exports.listUsers = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search;
    const skip = (page - 1) * limit;
    const take = limit;
    const { items, total } = await userService.listUsers({
        skip,
        take,
        search,
    });
    const totalPages = Math.ceil(total / limit);
    res.status(constants_1.HTTP_STATUS.OK).json(new ApiResponse_1.ApiResponse(true, 'Users fetched successfully', {
        items,
        pagination: {
            page,
            limit,
            total,
            totalPages,
        },
    }));
});
exports.getUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = req.params.id;
    const user = await userService.getUserById(id);
    res.status(constants_1.HTTP_STATUS.OK).json(new ApiResponse_1.ApiResponse(true, 'User details fetched successfully', user));
});
exports.attachPolicy = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = req.params.id;
    const { policyId } = req.body;
    const callerUserId = req.user.userId;
    const attachment = await userService.attachPolicy(id, policyId, callerUserId);
    res.status(constants_1.HTTP_STATUS.OK).json(new ApiResponse_1.ApiResponse(true, 'Policy attached to user successfully', attachment));
});
exports.detachPolicy = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = req.params.id;
    const policyId = req.params.policyId;
    const callerUserId = req.user.userId;
    await userService.detachPolicy(id, policyId, callerUserId);
    res.status(constants_1.HTTP_STATUS.OK).json(new ApiResponse_1.ApiResponse(true, 'Policy detached from user successfully', null));
});
exports.putBoundary = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = req.params.id;
    const { policyId } = req.body;
    const callerUserId = req.user.userId;
    const boundary = await userService.putBoundary(id, policyId, callerUserId);
    res.status(constants_1.HTTP_STATUS.OK).json(new ApiResponse_1.ApiResponse(true, 'Permissions Boundary set successfully', boundary));
});
exports.deleteBoundary = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = req.params.id;
    const callerUserId = req.user.userId;
    await userService.deleteBoundary(id, callerUserId);
    res.status(constants_1.HTTP_STATUS.OK).json(new ApiResponse_1.ApiResponse(true, 'Permissions Boundary deleted successfully', null));
});
exports.deleteUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = req.params.id;
    await userService.deleteUser(id);
    res.status(constants_1.HTTP_STATUS.OK).json(new ApiResponse_1.ApiResponse(true, 'User deleted successfully', null));
});
exports.getCredentialReport = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const report = await userService.getCredentialReport();
    res.status(constants_1.HTTP_STATUS.OK).json(new ApiResponse_1.ApiResponse(true, 'Credential report generated successfully', report));
});
