import { prisma } from '../../core/database/prisma';
import { User } from '@prisma/client';

export const findByEmail = async (email: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
};

export const findById = async (id: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: {
      id,
    },
  });
};

export const createUser = async (data: {
  name: string;
  email: string;
  passwordHash: string;
  isRoot: boolean;
}): Promise<User> => {
  return prisma.user.create({
    data,
  });
};
