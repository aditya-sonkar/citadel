"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const validate = (schema) => (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const parsed = (await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
    }));
    req.body = parsed.body;
    Object.defineProperty(req, 'query', {
        value: parsed.query,
        writable: true,
        configurable: true,
        enumerable: true,
    });
    Object.defineProperty(req, 'params', {
        value: parsed.params,
        writable: true,
        configurable: true,
        enumerable: true,
    });
    next();
});
exports.validate = validate;
