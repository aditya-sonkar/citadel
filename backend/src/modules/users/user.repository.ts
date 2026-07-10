import { prisma } from '../../core/database/prisma';
import { User } from '@prisma/client';

//1. Query to select the user with the ID
export const findById = async (id: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: {
      id,
    },
  });
};

//2. Query to Update the User Name
export const updateUser = async (
  id: string,
  data: { name?: string }
): Promise<User> => {
  return prisma.user.update({
    where: {
      id,
    },
    data,
  });
};

export interface ListUsersOptions {
  skip: number;
  take: number;
  search?: string;
}

export const listUsers = async (options: ListUsersOptions) => {
  const where: any = {};
  if (options.search) {
    where.OR = [
      { name: { contains: options.search, mode: 'insensitive' } },
      { email: { contains: options.search, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.user.findMany({
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
    prisma.user.count({ where }),
  ]);

  return { items, total };
};

export const findUserByIdWithDetails = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    include: {
      policies: {
        include: {
          policy: true,
        },
      },
      memberships: {
        include: {
          group: {
            include: {
              policies: {
                include: {
                  policy: true,
                },
              },
            },
          },
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

export const checkUserPolicyAttachmentExists = async (userId: string, policyId: string) => {
  const attachment = await prisma.userPolicyAttachment.findUnique({
    where: {
      userId_policyId: { userId, policyId },
    },
  });
  return !!attachment;
};

export const attachPolicyToUser = async (userId: string, policyId: string) => {
  return prisma.userPolicyAttachment.create({
    data: {
      userId,
      policyId,
    },
  });
};

export const detachPolicyFromUser = async (userId: string, policyId: string) => {
  return prisma.userPolicyAttachment.delete({
    where: {
      userId_policyId: { userId, policyId },
    },
  });
};

export const checkUserBoundaryExists = async (userId: string) => {
  const boundary = await prisma.userBoundary.findUnique({
    where: { userId },
  });
  return !!boundary;
};

export const upsertUserBoundary = async (userId: string, policyId: string) => {
  return prisma.userBoundary.upsert({
    where: { userId },
    update: { policyId },
    create: { userId, policyId },
  });
};

export const deleteUserBoundary = async (userId: string) => {
  return prisma.userBoundary.delete({
    where: { userId },
  });
};

export const updateUserPassword = async (id: string, passwordHash: string) => {
  return prisma.user.update({
    where: { id },
    data: { passwordHash },
  });
};