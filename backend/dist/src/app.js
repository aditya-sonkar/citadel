"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const index_1 = __importDefault(require("./routes/index"));
const notFound_middleware_1 = require("./core/middlewares/notFound.middleware");
const errorHandler_middleware_1 = require("./core/middlewares/errorHandler.middleware");
const appInstance = (0, express_1.default)();
// Trust proxy for accurate IP logging when deployed behind a Load Balancer (Render, Railway, etc.)
appInstance.set('trust proxy', 1);
// Security headers and CORS configuration
appInstance.use((0, helmet_1.default)());
appInstance.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
}));
// Request body parsers and cookies
appInstance.use(express_1.default.json());
appInstance.use(express_1.default.urlencoded({ extended: true }));
appInstance.use((0, cookie_parser_1.default)());
// Request Logging
appInstance.use((0, morgan_1.default)('dev'));
// Master Router Mounting
appInstance.use('/', index_1.default);
// Global 404 Route handler
appInstance.use(notFound_middleware_1.notFound);
// Global Exception Error Handler
appInstance.use(errorHandler_middleware_1.errorHandler);
exports.default = appInstance;
