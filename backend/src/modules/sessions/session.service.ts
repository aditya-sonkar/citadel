import { Session } from '@prisma/client';
import * as sessionRepository from './session.repository';

export const createSession = async (data: {
  userId: string;
  refreshTokenHash: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
}): Promise<Session> => {
  return sessionRepository.createSession(data);
};

export const findSessionByHash = async (
  refreshTokenHash: string
): Promise<Session | null> => {
  return sessionRepository.findSessionByHash(refreshTokenHash);
};

export const findSessionById = async (id: string): Promise<Session | null> => {
  return sessionRepository.findSessionById(id);
};

export const findSessionsByUserId = async (userId: string): Promise<Session[]> => {
  return sessionRepository.findSessionsByUserId(userId);
};

export const rotateSession = async (
  id: string,
  newHash: string,
  newExpiresAt: Date
): Promise<Session> => {
  return sessionRepository.updateSession(id, {
    refreshTokenHash: newHash,
    expiresAt: newExpiresAt,
  });
};

export const revokeSession = async (
  refreshTokenHash: string
): Promise<Session | null> => {
  return sessionRepository.deleteSessionByHash(refreshTokenHash);
};

export const revokeAllUserSessions = async (userId: string): Promise<void> => {
  return sessionRepository.deleteAllUserSessions(userId);
};
