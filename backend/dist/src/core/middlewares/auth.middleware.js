"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jwt_1 = require("../utils/jwt");
const ApiError_1 = require("../../shared/ApiError");
const constants_1 = require("../utils/constants");
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new ApiError_1.ApiError(constants_1.HTTP_STATUS.UNAUTHORIZED, 'Invalid or expired access token'));
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            isRoot: decoded.isRoot,
        };
        next();
    }
    catch (error) {
        next(new ApiError_1.ApiError(constants_1.HTTP_STATUS.UNAUTHORIZED, 'Invalid or expired access token'));
    }
};
exports.authMiddleware = authMiddleware;
