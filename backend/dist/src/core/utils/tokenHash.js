"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareToken = exports.hashToken = void 0;
const crypto_1 = __importDefault(require("crypto"));
const hashToken = (token) => {
    return crypto_1.default.createHash('sha256').update(token).digest('hex');
};
exports.hashToken = hashToken;
const compareToken = (token, hash) => {
    const incomingHash = (0, exports.hashToken)(token);
    if (incomingHash.length !== hash.length) {
        return false;
    }
    return crypto_1.default.timingSafeEqual(Buffer.from(incomingHash), Buffer.from(hash));
};
exports.compareToken = compareToken;
