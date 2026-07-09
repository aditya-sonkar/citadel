"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePolicy = exports.updatePolicy = exports.listPolicies = exports.findPolicyByNameCaseInsensitive = exports.findPolicyByIdWithCounts = exports.findPolicyById = exports.createPolicy = void 0;
const prisma_1 = require("../../core/database/prisma");
const createPolicy = async (data) => {
    return prisma_1.prisma.policy.create({
        data: {
            name: data.name.trim(),
            description: data.description,
            type: data.type,
            statements: data.statements,
        },
    });
};
exports.createPolicy = createPolicy;
const findPolicyById = async (id) => {
    return prisma_1.prisma.policy.findUnique({
        where: { id },
    });
};
exports.findPolicyById = findPolicyById;
const findPolicyByIdWithCounts = async (id) => {
    return prisma_1.prisma.policy.findUnique({
        where: { id },
        include: {
            _count: {
                select: {
                    userAttachments: true,
                    groupAttachments: true,
                },
            },
        },
    });
};
exports.findPolicyByIdWithCounts = findPolicyByIdWithCounts;
const findPolicyByNameCaseInsensitive = async (name) => {
    return prisma_1.prisma.policy.findFirst({
        where: {
            name: {
                equals: name.trim(),
                mode: 'insensitive',
            },
        },
    });
};
exports.findPolicyByNameCaseInsensitive = findPolicyByNameCaseInsensitive;
const listPolicies = async (options) => {
    const where = {};
    if (options.search) {
        where.OR = [
            { name: { contains: options.search, mode: 'insensitive' } },
            { description: { contains: options.search, mode: 'insensitive' } },
        ];
    }
    // Future: sorting support is fully integrated here
    const orderBy = {};
    if (options.sortBy) {
        orderBy[options.sortBy] = options.order || 'desc';
    }
    else {
        orderBy.createdAt = 'desc';
    }
    const [items, total] = await Promise.all([
        prisma_1.prisma.policy.findMany({
            where,
            skip: options.skip,
            take: options.take,
            orderBy,
        }),
        prisma_1.prisma.policy.count({ where }),
    ]);
    return { items, total };
};
exports.listPolicies = listPolicies;
const updatePolicy = async (id, data) => {
    const updateData = { ...data };
    if (data.name) {
        updateData.name = data.name.trim();
    }
    return prisma_1.prisma.policy.update({
        where: { id },
        data: updateData,
    });
};
exports.updatePolicy = updatePolicy;
const deletePolicy = async (id) => {
    return prisma_1.prisma.policy.delete({
        where: { id },
    });
};
exports.deletePolicy = deletePolicy;
