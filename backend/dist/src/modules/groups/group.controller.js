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
exports.detachPolicy = exports.attachPolicy = exports.removeMember = exports.addMember = exports.deleteGroup = exports.updateGroup = exports.listGroups = exports.getGroup = exports.createGroup = void 0;
const groupService = __importStar(require("./group.service"));
const ApiResponse_1 = require("../../shared/ApiResponse");
const constants_1 = require("../../core/utils/constants");
const asyncHandler_1 = require("../../core/utils/asyncHandler");
exports.createGroup = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const group = await groupService.createGroup(req.body, req.user.userId);
    res.status(constants_1.HTTP_STATUS.CREATED).json(new ApiResponse_1.ApiResponse(true, 'Group created successfully', group));
});
exports.getGroup = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = req.params.id;
    const group = await groupService.getGroupById(id);
    res.status(constants_1.HTTP_STATUS.OK).json(new ApiResponse_1.ApiResponse(true, 'Group details fetched successfully', group));
});
exports.listGroups = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search;
    const sortBy = req.query.sortBy;
    const order = req.query.order;
    const skip = (page - 1) * limit;
    const take = limit;
    const { items, total } = await groupService.listGroups({
        skip,
        take,
        search,
        sortBy,
        order,
    });
    const totalPages = Math.ceil(total / limit);
    res.status(constants_1.HTTP_STATUS.OK).json(new ApiResponse_1.ApiResponse(true, 'Groups fetched successfully', {
        items,
        pagination: {
            page,
            limit,
            total,
            totalPages,
        },
    }));
});
exports.updateGroup = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = req.params.id;
    const group = await groupService.updateGroup(id, req.body, req.user.userId);
    res.status(constants_1.HTTP_STATUS.OK).json(new ApiResponse_1.ApiResponse(true, 'Group updated successfully', group));
});
exports.deleteGroup = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = req.params.id;
    await groupService.deleteGroup(id, req.user.userId);
    res.status(constants_1.HTTP_STATUS.OK).json(new ApiResponse_1.ApiResponse(true, 'Group deleted successfully', null));
});
exports.addMember = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = req.params.id;
    const { userId } = req.body;
    const membership = await groupService.addMember(id, userId, req.user.userId);
    res.status(constants_1.HTTP_STATUS.CREATED).json(new ApiResponse_1.ApiResponse(true, 'User added to group successfully', membership));
});
exports.removeMember = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = req.params.id;
    const userId = req.params.userId;
    await groupService.removeMember(id, userId, req.user.userId);
    res.status(constants_1.HTTP_STATUS.OK).json(new ApiResponse_1.ApiResponse(true, 'User removed from group successfully', null));
});
exports.attachPolicy = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = req.params.id;
    const { policyId } = req.body;
    const callerUserId = req.user.userId;
    const attachment = await groupService.attachPolicy(id, policyId, callerUserId);
    res.status(constants_1.HTTP_STATUS.OK).json(new ApiResponse_1.ApiResponse(true, 'Policy attached to group successfully', attachment));
});
exports.detachPolicy = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = req.params.id;
    const policyId = req.params.policyId;
    await groupService.detachPolicy(id, policyId, req.user.userId);
    res.status(constants_1.HTTP_STATUS.OK).json(new ApiResponse_1.ApiResponse(true, 'Policy detached from group successfully', null));
});
