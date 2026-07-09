"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detachPolicyFromGroup = exports.attachPolicyToGroup = exports.checkPolicyAttachmentExists = exports.removeMemberFromGroup = exports.addMemberToGroup = exports.checkMembershipExists = exports.deleteGroupWithCleanup = exports.updateGroup = exports.listGroups = exports.findGroupByNameCaseInsensitive = exports.findGroupById = exports.createGroup = void 0;
const prisma_1 = require("../../core/database/prisma");
const createGroup = async (data) => {
    return prisma_1.prisma.group.create({
        data: {
            name: data.name.trim(),
            description: data.description,
        },
    });
};
exports.createGroup = createGroup;
const findGroupById = async (id) => {
    return prisma_1.prisma.group.findUnique({
        where: { id },
        include: {
            memberships: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true },
                    },
                },
            },
            policies: {
                include: {
                    policy: {
                        select: { id: true, name: true, type: true },
                    },
                },
            },
        },
    });
};
exports.findGroupById = findGroupById;
const findGroupByNameCaseInsensitive = async (name) => {
    return prisma_1.prisma.group.findFirst({
        where: {
            name: {
                equals: name.trim(),
                mode: 'insensitive',
            },
        },
    });
};
exports.findGroupByNameCaseInsensitive = findGroupByNameCaseInsensitive;
const listGroups = async (options) => {
    const where = {};
    if (options.search) {
        where.OR = [
            { name: { contains: options.search, mode: 'insensitive' } },
            { description: { contains: options.search, mode: 'insensitive' } },
        ];
    }
    // Future: sorting support
    const orderBy = {};
    if (options.sortBy) {
        orderBy[options.sortBy] = options.order || 'desc';
    }
    else {
        orderBy.createdAt = 'desc';
    }
    const [items, total] = await Promise.all([
        prisma_1.prisma.group.findMany({
            where,
            skip: options.skip,
            take: options.take,
            orderBy,
            include: {
                _count: {
                    select: {
                        memberships: true,
                        policies: true,
                    },
                },
            },
        }),
        prisma_1.prisma.group.count({ where }),
    ]);
    return { items, total };
};
exports.listGroups = listGroups;
const updateGroup = async (id, data) => {
    const updateData = { ...data };
    if (data.name) {
        updateData.name = data.name.trim();
    }
    return prisma_1.prisma.group.update({
        where: { id },
        data: updateData,
    });
};
exports.updateGroup = updateGroup;
const deleteGroupWithCleanup = async (id) => {
    return prisma_1.prisma.$transaction(async (tx) => {
        // 1. Delete group memberships
        await tx.userGroupMembership.deleteMany({
            where: { groupId: id },
        });
        // 2. Load group attachments to identify inline vs managed policies
        const attachments = await tx.groupPolicyAttachment.findMany({
            where: { groupId: id },
            include: { policy: true },
        });
        const inlinePolicyIds = attachments
            .filter((a) => a.policy.type === 'INLINE')
            .map((a) => a.policyId);
        const managedPolicyIds = attachments
            .filter((a) => a.policy.type === 'MANAGED')
            .map((a) => a.policyId);
        // 3. Detach MANAGED policies
        if (managedPolicyIds.length > 0) {
            await tx.groupPolicyAttachment.deleteMany({
                where: {
                    groupId: id,
                    policyId: { in: managedPolicyIds },
                },
            });
        }
        // 4. Delete INLINE policies (detaching first, then deleting)
        if (inlinePolicyIds.length > 0) {
            await tx.groupPolicyAttachment.deleteMany({
                where: {
                    groupId: id,
                    policyId: { in: inlinePolicyIds },
                },
            });
            await tx.policy.deleteMany({
                where: {
                    id: { in: inlinePolicyIds },
                },
            });
        }
        // 5. Delete the group itself
        return tx.group.delete({
            where: { id },
        });
    });
};
exports.deleteGroupWithCleanup = deleteGroupWithCleanup;
const checkMembershipExists = async (groupId, userId) => {
    const membership = await prisma_1.prisma.userGroupMembership.findUnique({
        where: {
            userId_groupId: { userId, groupId },
        },
    });
    return !!membership;
};
exports.checkMembershipExists = checkMembershipExists;
const addMemberToGroup = async (groupId, userId) => {
    return prisma_1.prisma.userGroupMembership.create({
        data: {
            groupId,
            userId,
        },
    });
};
exports.addMemberToGroup = addMemberToGroup;
const removeMemberFromGroup = async (groupId, userId) => {
    return prisma_1.prisma.userGroupMembership.delete({
        where: {
            userId_groupId: { userId, groupId },
        },
    });
};
exports.removeMemberFromGroup = removeMemberFromGroup;
const checkPolicyAttachmentExists = async (groupId, policyId) => {
    const attachment = await prisma_1.prisma.groupPolicyAttachment.findUnique({
        where: {
            groupId_policyId: { groupId, policyId },
        },
    });
    return !!attachment;
};
exports.checkPolicyAttachmentExists = checkPolicyAttachmentExists;
const attachPolicyToGroup = async (groupId, policyId) => {
    return prisma_1.prisma.groupPolicyAttachment.create({
        data: {
            groupId,
            policyId,
        },
    });
};
exports.attachPolicyToGroup = attachPolicyToGroup;
const detachPolicyFromGroup = async (groupId, policyId) => {
    return prisma_1.prisma.groupPolicyAttachment.delete({
        where: {
            groupId_policyId: { groupId, policyId },
        },
    });
};
exports.detachPolicyFromGroup = detachPolicyFromGroup;
