"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = void 0;
const constants_1 = require("../utils/constants");
const notFound = (req, res, next) => {
    res.status(constants_1.HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Route not found',
    });
};
exports.notFound = notFound;
