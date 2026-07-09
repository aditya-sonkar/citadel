"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchResource = exports.matchAction = void 0;
/**
 * Converts a wildcard pattern to a RegExp and tests the value against it.
 *
 * Supported patterns:
 *   "*"          → matches everything
 *   "reports:*"  → matches reports:List, reports:Read, reports:Create, etc.
 *   "reports:List" → exact match only
 */
const regexCache = new Map();
const matchPattern = (value, pattern) => {
    let regex = regexCache.get(pattern);
    if (!regex) {
        const escaped = pattern
            .replace(/[.+^${}()|[\]\\]/g, '\\$&')
            .replace(/\*/g, '.*');
        regex = new RegExp(`^${escaped}$`, 'i');
        regexCache.set(pattern, regex);
    }
    return regex.test(value);
};
/**
 * Returns true if the action matches any pattern in the list.
 */
const matchAction = (action, patterns) => {
    return patterns.some((pattern) => matchPattern(action, pattern));
};
exports.matchAction = matchAction;
/**
 * Returns true if the resource matches any pattern in the list.
 */
const matchResource = (resource, patterns) => {
    return patterns.some((pattern) => matchPattern(resource, pattern));
};
exports.matchResource = matchResource;
