"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogById = exports.listLogs = exports.log = exports.sanitizeMetadata = void 0;
const prisma_1 = require("../../core/database/prisma");
const logger_1 = require("../../core/logger/logger");
/**
 * Sanitizes metadata payloads to prevent database bloat.
 * Restricts nesting depth, truncates long strings, and limits key count.
 */
const sanitizeMetadata = (metadata) => {
    if (metadata === undefined || metadata === null)
        return null;
    const recurse = (val, depth) => {
        if (depth > 3)
            return { _truncated: 'Depth limit exceeded' };
        if (val === null || val === undefined)
            return null;
        if (Array.isArray(val)) {
            return val.slice(0, 50).map((item) => recurse(item, depth + 1));
        }
        if (typeof val === 'object') {
            const keys = Object.keys(val);
            if (keys.length > 50) {
                return { _truncated: 'Key count limit exceeded' };
            }
            const cleaned = {};
            for (const k of keys) {
                cleaned[k] = recurse(val[k], depth + 1);
            }
            return cleaned;
        }
        if (typeof val === 'string') {
            if (val.length > 1000) {
                return val.substring(0, 1000) + '... (truncated)';
            }
            return val;
        }
        return val;
    };
    try {
        return recurse(metadata, 1);
    }
    catch (e) {
        return { error: 'Failed to serialize metadata' };
    }
};
exports.sanitizeMetadata = sanitizeMetadata;
/**
 * Log action to database asynchronously.
 * Guarantees resilience by wrapping DB write in a catch block so request execution is never blocked.
 */
const log = (data) => {
    const sanitized = (0, exports.sanitizeMetadata)(data.metadata);
    (async () => {
        try {
            let email = data.userEmail;
            if (!email && data.userId) {
                const user = await prisma_1.prisma.user.findUnique({
                    where: { id: data.userId },
                    select: { email: true }
                });
                if (user)
                    email = user.email;
            }
            await prisma_1.prisma.auditLog.create({
                data: {
                    userId: data.userId,
                    userEmail: email,
                    action: data.action,
                    targetResource: data.targetResource,
                    targetType: data.targetType,
                    targetId: data.targetId,
                    effect: data.effect,
                    decision: data.decision,
                    ipAddress: data.ipAddress,
                    userAgent: data.userAgent,
                    metadata: sanitized,
                },
            });
        }
        catch (err) {
            // Non-blocking catch to ensure database failure resilience
            logger_1.logger.error({ error: err.message, action: data.action, detail: 'Audit logging database write failed' });
        }
    })();
};
exports.log = log;
const listLogs = async (options) => {
    const where = {};
    if (options.search) {
        where.OR = [
            { userEmail: { contains: options.search, mode: 'insensitive' } },
            { action: { contains: options.search, mode: 'insensitive' } },
            { targetResource: { contains: options.search, mode: 'insensitive' } },
        ];
    }
    if (options.action) {
        where.action = options.action;
    }
    if (options.effect) {
        where.effect = options.effect;
    }
    if (options.decision) {
        where.decision = options.decision;
    }
    if (options.userId) {
        where.userId = options.userId;
    }
    if (options.fromDate || options.toDate) {
        where.timestamp = {};
        if (options.fromDate) {
            where.timestamp.gte = options.fromDate;
        }
        if (options.toDate) {
            where.timestamp.lte = options.toDate;
        }
    }
    const [items, total] = await Promise.all([
        prisma_1.prisma.auditLog.findMany({
            where,
            skip: options.skip,
            take: options.take,
            orderBy: { timestamp: 'desc' },
        }),
        prisma_1.prisma.auditLog.count({ where }),
    ]);
    return { items, total };
};
exports.listLogs = listLogs;
const getLogById = async (id) => {
    return prisma_1.prisma.auditLog.findUnique({
        where: { id },
    });
};
exports.getLogById = getLogById;
