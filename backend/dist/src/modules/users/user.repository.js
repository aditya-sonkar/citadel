"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserBoundary = exports.upsertUserBoundary = exports.checkUserBoundaryExists = exports.detachPolicyFromUser = exports.attachPolicyToUser = exports.checkUserPolicyAttachmentExists = exports.findUserByIdWithDetails = exports.listUsers = exports.updateUser = exports.findById = void 0;
const prisma_1 = require("../../core/database/prisma");
//1. Query to select the user with the ID
const findById = async (id) => {
    return prisma_1.prisma.user.findUnique({
        where: {
            id,
        },
    });
};
exports.findById = findById;
//2. Query to Update the User Name
const updateUser = async (id, data) => {
    return prisma_1.prisma.user.update({
        where: {
            id,
        },
        data,
    });
};
exports.updateUser = updateUser;
const listUsers = async (options) => {
    const where = {};
    if (options.search) {
        where.OR = [
            { name: { contains: options.search, mode: 'insensitive' } },
            { email: { contains: options.search, mode: 'insensitive' } },
        ];
    }
    const [items, total] = await Promise.all([
        prisma_1.prisma.user.findMany({
            where,
            skip: options.skip,
            take: options.take,
            orderBy: { createdAt: 'desc' },
            include: {
                policies: {
                    select: {
                        policy: {
                            select: {
                                type: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        memberships: true,
                    },
                },
                boundary: true,
            },
        }),
        prisma_1.prisma.user.count({ where }),
    ]);
    return { items, total };
};
exports.listUsers = listUsers;
const findUserByIdWithDetails = async (id) => {
    return prisma_1.prisma.user.findUnique({
        where: { id },
        include: {
            policies: {
                include: {
                    policy: true,
                },
            },
            memberships: {
                include: {
                    group: true,
                },
            },
            boundary: {
                include: {
                    policy: true,
                },
            },
        },
    });
};
exports.findUserByIdWithDetails = findUserByIdWithDetails;
const checkUserPolicyAttachmentExists = async (userId, policyId) => {
    const attachment = await prisma_1.prisma.userPolicyAttachment.findUnique({
        where: {
            userId_policyId: { userId, policyId },
        },
    });
    return !!attachment;
};
exports.checkUserPolicyAttachmentExists = checkUserPolicyAttachmentExists;
const attachPolicyToUser = async (userId, policyId) => {
    return prisma_1.prisma.userPolicyAttachment.create({
        data: {
            userId,
            policyId,
        },
    });
};
exports.attachPolicyToUser = attachPolicyToUser;
const detachPolicyFromUser = async (userId, policyId) => {
    return prisma_1.prisma.userPolicyAttachment.delete({
        where: {
            userId_policyId: { userId, policyId },
        },
    });
};
exports.detachPolicyFromUser = detachPolicyFromUser;
const checkUserBoundaryExists = async (userId) => {
    const boundary = await prisma_1.prisma.userBoundary.findUnique({
        where: { userId },
    });
    return !!boundary;
};
exports.checkUserBoundaryExists = checkUserBoundaryExists;
const upsertUserBoundary = async (userId, policyId) => {
    return prisma_1.prisma.userBoundary.upsert({
        where: { userId },
        update: { policyId },
        create: { userId, policyId },
    });
};
exports.upsertUserBoundary = upsertUserBoundary;
const deleteUserBoundary = async (userId) => {
    return prisma_1.prisma.userBoundary.delete({
        where: { userId },
    });
};
exports.deleteUserBoundary = deleteUserBoundary;
