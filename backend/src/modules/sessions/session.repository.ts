import { prisma } from '../../core/database/prisma';
import { Session } from '@prisma/client';

export const createSession = async (data: {
  userId: string;
  refreshTokenHash: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
}): Promise<Session> => {
  return prisma.session.create({
    data,
  });
};

export const findSessionByHash = async (
  refreshTokenHash: string
): Promise<Session | null> => {
  return prisma.session.findUnique({
    where: {
      refreshTokenHash,
    },
  });
};

export const findSessionById = async (id: string): Promise<Session | null> => {
  return prisma.session.findUnique({
    where: {
      id,
    },
  });
};

export const findSessionsByUserId = async (userId: string): Promise<Session[]> => {
  return prisma.session.findMany({
    where: {
      userId,
    },
  });
};

export const updateSession = async (
  id: string,
  data: {
    refreshTokenHash: string;
    expiresAt: Date;
  }
): Promise<Session> => {
  return prisma.session.update({
    where: {
      id,
    },
    data,
  });
};

export const deleteSessionByHash = async (
  refreshTokenHash: string
): Promise<Session | null> => {
  const session = await prisma.session.findUnique({
    where: {
      refreshTokenHash,
    },
  });

  if (!session) return null;

  await prisma.session.delete({
    where: {
      refreshTokenHash,
    },
  });

  return session;
};

export const deleteAllUserSessions = async (userId: string): Promise<void> => {
  await prisma.session.deleteMany({
    where: {
      userId,
    },
  });
};
