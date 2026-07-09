"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const ApiError_1 = require("../../shared/ApiError");
const env_1 = require("../config/env");
const logger_1 = require("../logger/logger");
const constants_1 = require("../utils/constants");
const errorHandler = (err, req, res, next) => {
    let error = err;
    // Map non-ApiError instances
    if (!(error instanceof ApiError_1.ApiError)) {
        let statusCode = constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR;
        let message = error.message || 'Internal Server Error';
        if (error instanceof zod_1.ZodError) {
            statusCode = constants_1.HTTP_STATUS.BAD_REQUEST;
            message = 'Validation error';
        }
        else if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                statusCode = constants_1.HTTP_STATUS.CONFLICT;
                message = 'Resource already exists';
            }
            else {
                statusCode = constants_1.HTTP_STATUS.BAD_REQUEST;
                message = `Database operation failed`;
            }
        }
        error = new ApiError_1.ApiError(statusCode, message, false, err.stack);
    }
    // Log error
    logger_1.logger.error(`[${req.method}] ${req.originalUrl} - Status: ${error.statusCode} - Message: ${error.message}`);
    if (env_1.env.NODE_ENV === 'development') {
        console.error(err);
    }
    const response = {
        success: false,
        message: error.message,
        ...(err instanceof zod_1.ZodError && { errors: err.issues }),
        ...(env_1.env.NODE_ENV === 'development' && { stack: error.stack }),
    };
    res.status(error.statusCode).json(response);
};
exports.errorHandler = errorHandler;
