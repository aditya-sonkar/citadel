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
exports.getProfile = exports.logout = exports.refresh = exports.login = exports.register = void 0;
const ApiError_1 = require("../../shared/ApiError");
const constants_1 = require("../../core/utils/constants");
const authRepository = __importStar(require("./auth.repository"));
const sessionService = __importStar(require("../sessions/session.service"));
const hash_1 = require("../../core/utils/hash");
const jwt_1 = require("../../core/utils/jwt");
const tokenHash_1 = require("../../core/utils/tokenHash");
const env_1 = require("../../core/config/env");
// Helper to parse JWT access expiry into seconds
const getAccessTokenExpirySeconds = () => {
    let expiresIn = 900; // default 15m in seconds
    const match = env_1.env.JWT_ACCESS_EXPIRY.match(/^(\d+)([smhd])$/);
    if (match) {
        const value = parseInt(match[1], 10);
        const unit = match[2];
        if (unit === 's')
            expiresIn = value;
        else if (unit === 'm')
            expiresIn = value * 60;
        else if (unit === 'h')
            expiresIn = value * 3600;
        else if (unit === 'd')
            expiresIn = value * 86400;
    }
    return expiresIn;
};
const register = async (data) => {
    const existingUser = await authRepository.findByEmail(data.email);
    if (existingUser) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.CONFLICT, 'Resource already exists');
    }
    const passwordHash = await (0, hash_1.hashPassword)(data.password);
    const user = await authRepository.createUser({
        name: data.name,
        email: data.email,
        passwordHash,
        isRoot: false, // Enforce isRoot = false during registration
    });
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
    };
};
exports.register = register;
const login = async (credentials, requestInfo) => {
    const user = await authRepository.findByEmail(credentials.email);
    if (!user) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password');
    }
    const isPasswordValid = await (0, hash_1.comparePassword)(credentials.password, user.passwordHash);
    if (!isPasswordValid) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password');
    }
    const userClaims = {
        userId: user.id,
        email: user.email,
        isRoot: user.isRoot,
    };
    const accessToken = (0, jwt_1.generateAccessToken)(userClaims);
    const refreshToken = (0, jwt_1.generateRefreshToken)(userClaims);
    const refreshTokenHash = (0, tokenHash_1.hashToken)(refreshToken);
    // Set session expiry (matches 7 days refresh token expiry)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await sessionService.createSession({
        userId: user.id,
        refreshTokenHash,
        userAgent: requestInfo.userAgent,
        ipAddress: requestInfo.ipAddress,
        expiresAt,
    });
    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            isRoot: user.isRoot,
            createdAt: user.createdAt,
        },
        accessToken,
        refreshToken,
        expiresIn: getAccessTokenExpirySeconds(),
    };
};
exports.login = login;
const refresh = async (refreshToken, requestInfo) => {
    let decoded;
    try {
        decoded = (0, jwt_1.verifyRefreshToken)(refreshToken);
    }
    catch (error) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.UNAUTHORIZED, 'Invalid or expired refresh token');
    }
    const incomingHash = (0, tokenHash_1.hashToken)(refreshToken);
    const session = await sessionService.findSessionByHash(incomingHash);
    // Token Reuse Detection (Replay Attack)
    if (!session) {
        await sessionService.revokeAllUserSessions(decoded.userId);
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.UNAUTHORIZED, 'Invalid or expired refresh token');
    }
    // Database Session Expiry verification
    if (session.expiresAt <= new Date()) {
        await sessionService.revokeSession(incomingHash);
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.UNAUTHORIZED, 'Invalid or expired refresh token');
    }
    const user = await authRepository.findById(decoded.userId);
    if (!user) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.UNAUTHORIZED, 'Invalid or expired refresh token');
    }
    const userClaims = {
        userId: user.id,
        email: user.email,
        isRoot: user.isRoot,
    };
    const newAccessToken = (0, jwt_1.generateAccessToken)(userClaims);
    const newRefreshToken = (0, jwt_1.generateRefreshToken)(userClaims);
    const newHash = (0, tokenHash_1.hashToken)(newRefreshToken);
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await sessionService.rotateSession(session.id, newHash, newExpiresAt);
    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: getAccessTokenExpirySeconds(),
    };
};
exports.refresh = refresh;
const logout = async (refreshToken) => {
    const hash = (0, tokenHash_1.hashToken)(refreshToken);
    await sessionService.revokeSession(hash);
};
exports.logout = logout;
const getProfile = async (userId) => {
    const user = await authRepository.findById(userId);
    if (!user) {
        throw new ApiError_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, 'User not found');
    }
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        isRoot: user.isRoot,
        createdAt: user.createdAt,
    };
};
exports.getProfile = getProfile;
