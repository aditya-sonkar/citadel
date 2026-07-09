import { prisma } from '../../core/database/prisma';
import { PolicyType } from '@prisma/client';

export interface CreatePolicyInput {
  name: string;
  description?: string;
  type: PolicyType;
  statements: any;
  userId?: string;
  groupId?: string;
}

export interface UpdatePolicyInput {
  name?: string;
  description?: string;
  type?: PolicyType;
  statements?: any;
}

export const createPolicy = async (data: CreatePolicyInput) => {
  return prisma.policy.create({
    data: {
      name: data.name.trim(),
      description: data.description,
      type: data.type,
      statements: data.statements,
    },
  });
};

export const findPolicyById = async (id: string) => {
  return prisma.policy.findUnique({
    where: { id },
  });
};

export const findPolicyByIdWithCounts = async (id: string) => {
  return prisma.policy.findUnique({
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

export const findPolicyByNameCaseInsensitive = async (name: string) => {
  return prisma.policy.findFirst({
    where: {
      name: {
        equals: name.trim(),
        mode: 'insensitive',
      },
    },
  });
};

export interface ListPoliciesOptions {
  skip: number;
  take: number;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  type?: PolicyType;
}

export const listPolicies = async (options: ListPoliciesOptions) => {
  const where: any = {
    type: options.type !== undefined ? options.type : PolicyType.MANAGED
  };
  if (options.search) {
    where.OR = [
      { name: { contains: options.search, mode: 'insensitive' } },
      { description: { contains: options.search, mode: 'insensitive' } },
    ];
  }

  // Future: sorting support is fully integrated here
  const orderBy: any = {};
  if (options.sortBy) {
    orderBy[options.sortBy] = options.order || 'desc';
  } else {
    orderBy.createdAt = 'desc';
  }

  const [items, total] = await Promise.all([
    prisma.policy.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        createdAt: true,
        updatedAt: true,
      },
      skip: options.skip,
      take: options.take,
      orderBy,
    }),
    prisma.policy.count({ where }),
  ]);

  return { items, total };
};

export const updatePolicy = async (id: string, data: UpdatePolicyInput) => {
  const updateData: any = { ...data };
  if (data.name) {
    updateData.name = data.name.trim();
  }
  return prisma.policy.update({
    where: { id },
    data: updateData,
  });
};

export const deletePolicy = async (id: string) => {
  return prisma.policy.delete({
    where: { id },
  });
};

export const getPolicyAttachments = async (id: string) => {
  const [users, groups] = await Promise.all([
    prisma.userPolicyAttachment.findMany({
      where: { policyId: id },
      select: {
        user: {
          select: {
            email: true,
          },
        },
      },
    }),
    prisma.groupPolicyAttachment.findMany({
      where: { policyId: id },
      select: {
        group: {
          select: {
            name: true,
          },
        },
      },
    }),
  ]);

  return {
    users: users.map((u) => u.user.email),
    groups: groups.map((g) => g.group.name),
  };
};

