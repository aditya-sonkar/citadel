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
exports.deleteBoundary = exports.putBoundary = exports.detachPolicy = exports.attachPolicy = exports.getEffectiveAccess = exports.getResolvedStatements = exports.getUser = exports.listUsers = void 0;
const userIamService = __importStar(require("./user-iam.service"));
const ApiResponse_1 = require("../../shared/ApiResponse");
const constants_1 = require("../../core/utils/constants");
const asyncHandler_1 = require("../../core/utils/asyncHandler");
exports.listUsers = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search;
    const skip = (page - 1) * limit;
    const take = limit;
    const { items, total } = await userIamService.listUsers({
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
    const user = await userIamService.getUserById(id);
    res.status(constants_1.HTTP_STATUS.OK).json(new ApiResponse_1.ApiResponse(true, 'User details fetched successfully', user));
});
exports.getResolvedStatements = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = req.params.id;
    const resolved = await userIamService.getResolvedStatements(id);
    res.status(constants_1.HTTP_STATUS.OK).json(new ApiResponse_1.ApiResponse(true, 'Resolved statements fetched successfully', resolved));
});
exports.getEffectiveAccess = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = req.params.id;
    const access = await userIamService.getEffectiveAccess(id);
    res.status(constants_1.HTTP_STATUS.OK).json(new ApiResponse_1.ApiResponse(true, 'Effective access fetched successfully', access));
});
exports.attachPolicy = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = req.params.id;
    const { policyId } = req.body;
    const callerUserId = req.user.userId;
    const attachment = await userIamService.attachPolicy(id, policyId, callerUserId);
    res.status(constants_1.HTTP_STATUS.OK).json(new ApiResponse_1.ApiResponse(true, 'Policy attached to user successfully', attachment));
});
exports.detachPolicy = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = req.params.id;
    const policyId = req.params.policyId;
    const callerUserId = req.user.userId;
    await userIamService.detachPolicy(id, policyId, callerUserId);
    res.status(constants_1.HTTP_STATUS.OK).json(new ApiResponse_1.ApiResponse(true, 'Policy detached from user successfully', null));
});
exports.putBoundary = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = req.params.id;
    const { policyId } = req.body;
    const callerUserId = req.user.userId;
    const boundary = await userIamService.putBoundary(id, policyId, callerUserId);
    res.status(constants_1.HTTP_STATUS.OK).json(new ApiResponse_1.ApiResponse(true, 'Permissions Boundary set successfully', boundary));
});
exports.deleteBoundary = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = req.params.id;
    await userIamService.deleteBoundary(id);
    res.status(constants_1.HTTP_STATUS.OK).json(new ApiResponse_1.ApiResponse(true, 'Permissions Boundary deleted successfully', null));
});
