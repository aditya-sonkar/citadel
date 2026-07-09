import { prisma } from '../../core/database/prisma';

export interface CreateGroupInput {
  name: string;
  description?: string;
}

export interface UpdateGroupInput {
  name?: string;
  description?: string;
}

export const createGroup = async (data: CreateGroupInput) => {
  return prisma.group.create({
    data: {
      name: data.name.trim(),
      description: data.description,
    },
  });
};

export const findGroupById = async (id: string) => {
  return prisma.group.findUnique({
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

export const findGroupByNameCaseInsensitive = async (name: string) => {
  return prisma.group.findFirst({
    where: {
      name: {
        equals: name.trim(),
        mode: 'insensitive',
      },
    },
  });
};

export interface ListGroupsOptions {
  skip: number;
  take: number;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export const listGroups = async (options: ListGroupsOptions) => {
  const where: any = {};
  if (options.search) {
    where.OR = [
      { name: { contains: options.search, mode: 'insensitive' } },
      { description: { contains: options.search, mode: 'insensitive' } },
    ];
  }

  // Future: sorting support
  const orderBy: any = {};
  if (options.sortBy) {
    orderBy[options.sortBy] = options.order || 'desc';
  } else {
    orderBy.createdAt = 'desc';
  }

  const [items, total] = await Promise.all([
    prisma.group.findMany({
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
    prisma.group.count({ where }),
  ]);

  return { items, total };
};

export const updateGroup = async (id: string, data: UpdateGroupInput) => {
  const updateData: any = { ...data };
  if (data.name) {
    updateData.name = data.name.trim();
  }
  return prisma.group.update({
    where: { id },
    data: updateData,
  });
};

export const deleteGroupWithCleanup = async (id: string) => {
  return prisma.$transaction(async (tx) => {
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

export const checkMembershipExists = async (groupId: string, userId: string) => {
  const membership = await prisma.userGroupMembership.findUnique({
    where: {
      userId_groupId: { userId, groupId },
    },
  });
  return !!membership;
};

export const addMemberToGroup = async (groupId: string, userId: string) => {
  return prisma.userGroupMembership.create({
    data: {
      groupId,
      userId,
    },
  });
};

export const removeMemberFromGroup = async (groupId: string, userId: string) => {
  return prisma.userGroupMembership.delete({
    where: {
      userId_groupId: { userId, groupId },
    },
  });
};

export const checkPolicyAttachmentExists = async (groupId: string, policyId: string) => {
  const attachment = await prisma.groupPolicyAttachment.findUnique({
    where: {
      groupId_policyId: { groupId, policyId },
    },
  });
  return !!attachment;
};

export const attachPolicyToGroup = async (groupId: string, policyId: string) => {
  return prisma.groupPolicyAttachment.create({
    data: {
      groupId,
      policyId,
    },
  });
};

export const detachPolicyFromGroup = async (groupId: string, policyId: string) => {
  return prisma.groupPolicyAttachment.delete({
    where: {
      groupId_policyId: { groupId, policyId },
    },
  });
};
