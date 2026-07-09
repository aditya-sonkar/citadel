"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ok = void 0;
/**
 * Reusable dummy controller for IAM testing.
 * Returns { success: true, message: "OK" } for all authorized requests.
 */
const ok = (req, res) => {
    res.status(200).json({
        success: true,
        message: 'OK'
    });
};
exports.ok = ok;
