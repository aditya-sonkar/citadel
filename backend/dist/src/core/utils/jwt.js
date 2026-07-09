"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const constants_1 = require("./constants");
const generateAccessToken = (payload) => {
    const tokenPayload = {
        ...payload,
        type: constants_1.TOKEN_TYPES.ACCESS,
    };
    return jsonwebtoken_1.default.sign(tokenPayload, env_1.env.JWT_ACCESS_SECRET, {
        expiresIn: env_1.env.JWT_ACCESS_EXPIRY,
    });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (payload) => {
    const tokenPayload = {
        ...payload,
        type: constants_1.TOKEN_TYPES.REFRESH,
    };
    return jsonwebtoken_1.default.sign(tokenPayload, env_1.env.JWT_REFRESH_SECRET, {
        expiresIn: env_1.env.JWT_REFRESH_EXPIRY,
    });
};
exports.generateRefreshToken = generateRefreshToken;
const verifyAccessToken = (token) => {
    const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_ACCESS_SECRET);
    if (decoded.type !== constants_1.TOKEN_TYPES.ACCESS) {
        throw new Error('Invalid token type: Expected access token');
    }
    return decoded;
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_REFRESH_SECRET);
    if (decoded.type !== constants_1.TOKEN_TYPES.REFRESH) {
        throw new Error('Invalid token type: Expected refresh token');
    }
    return decoded;
};
exports.verifyRefreshToken = verifyRefreshToken;
