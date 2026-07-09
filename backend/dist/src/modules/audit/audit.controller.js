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
exports.getLog = exports.listLogs = void 0;
const auditService = __importStar(require("./audit.service"));
const ApiResponse_1 = require("../../shared/ApiResponse");
const constants_1 = require("../../core/utils/constants");
const asyncHandler_1 = require("../../core/utils/asyncHandler");
const ApiError_1 = require("../../shared/ApiError");
exports.listLogs = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search;
    const action = req.query.action;
    const effect = req.query.effect;
    const decision = req.query.decision;
    const userId = req.query.userId;
    let fromDate;
    let toDate;
    if (req.query.fromDate) {
        fromDate = new Date(req.query.fromDate);
    }
    if (req.query.toDate) {
        toDate = new Date(req.query.toDate);
    }
    const skip = (page - 1) * limit;
    const take = limit;
    const { items, total } = await auditService.listLogs({
        skip,
        take,
        search,
        action,
        effect,
        decision,
        userId,
        fromDate,
        toDate,
    });
    const totalPages = Math.ceil(total / limit);
    res.status(constants_1.HTTP_STATUS.OK).json(new ApiResponse_1.ApiResponse(true, 'Audit logs fetched successfully', {
        items,
        pagination: {
            page,
            limit,
            total,
            totalPages,
        },
    }));
});
exports.getLog = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = req.params.id;
    const log = await auditService.getLogById(id);
    if (!log) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, 'Audit log not found');
    }
    res.status(constants_1.HTTP_STATUS.OK).json(new ApiResponse_1.ApiResponse(true, 'Audit log details fetched successfully', log));
});
