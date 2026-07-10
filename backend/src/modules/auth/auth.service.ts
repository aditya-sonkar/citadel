import { ApiError } from '../../shared/ApiError';
import { HTTP_STATUS } from '../../core/utils/constants';
import * as authRepository from './auth.repository';
import * as sessionService from '../sessions/session.service';
import { hashPassword, comparePassword } from '../../core/utils/hash';
import { prisma } from '../../core/database/prisma';
import { validatePasswordAgainstPolicy } from '../resources/settings.service';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../core/utils/jwt';
import { hashToken } from '../../core/utils/tokenHash';
import { env } from '../../core/config/env';
import { RegisterInput, LoginInput, AuthResponsePayload, AuthUserPayload } from './auth.types';

// Helper to parse JWT access expiry into seconds
const getAccessTokenExpirySeconds = (): number => {
  let expiresIn = 900; // default 15m in seconds
  const match = env.JWT_ACCESS_EXPIRY.match(/^(\d+)([smhd])$/);
  if (match) {
    const value = parseInt(match[1], 10);
    const unit = match[2];
    if (unit === 's') expiresIn = value;
    else if (unit === 'm') expiresIn = value * 60;
    else if (unit === 'h') expiresIn = value * 3600;
    else if (unit === 'd') expiresIn = value * 86400;
  }
  return expiresIn;
};

// Helper to parse JWT refresh expiry into seconds
const getRefreshTokenExpirySeconds = (): number => {
  let expiresIn = 7 * 24 * 3600; // default 7d in seconds
  const match = env.JWT_REFRESH_EXPIRY.match(/^(\d+)([smhd])$/);
  if (match) {
    const value = parseInt(match[1], 10);
    const unit = match[2];
    if (unit === 's') expiresIn = value;
    else if (unit === 'm') expiresIn = value * 60;
    else if (unit === 'h') expiresIn = value * 3600;
    else if (unit === 'd') expiresIn = value * 86400;
  }
  return expiresIn;
};

export const register = async (
  data: RegisterInput
): Promise<Omit<AuthUserPayload, 'isRoot'>> => {
  const existingUser = await authRepository.findByEmail(data.email);
  if (existingUser) {
    throw new ApiError(HTTP_STATUS.CONFLICT, 'Resource already exists');
  }

  const validation = validatePasswordAgainstPolicy(data.password);
  if (!validation.isValid) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, validation.errors.join('. '));
  }

  const passwordHash = await hashPassword(data.password);
  const user = await authRepository.createUser({
    name: data.name,
    email: data.email,
    passwordHash,
    isRoot: false, // Enforce isRoot = false during registration
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
};

export const login = async (
  credentials: LoginInput,
  requestInfo: { userAgent?: string; ipAddress?: string }
): Promise<AuthResponsePayload> => {
  const user = await authRepository.findByEmail(credentials.email);
  if (!user) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password');
  }

  const isPasswordValid = await comparePassword(credentials.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password');
  }

  const userClaims = {
    userId: user.id,
    email: user.email,
    isRoot: user.isRoot,
  };

  const accessToken = generateAccessToken(userClaims);
  const refreshToken = generateRefreshToken(userClaims);
  const refreshTokenHash = hashToken(refreshToken);

  // Set session expiry dynamically based on env config
  const expiresAt = new Date(Date.now() + getRefreshTokenExpirySeconds() * 1000);

  await sessionService.createSession({
    userId: user.id,
    refreshTokenHash,
    userAgent: requestInfo.userAgent,
    ipAddress: requestInfo.ipAddress,
    expiresAt,
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      isRoot: user.isRoot,
      createdAt: user.createdAt,
    },
    accessToken,
    refreshToken,
    expiresIn: getAccessTokenExpirySeconds(),
  };
};

export const refresh = async (
  refreshToken: string,
  requestInfo: { userAgent?: string; ipAddress?: string }
): Promise<Omit<AuthResponsePayload, 'user'>> => {
  let decoded: any;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    console.error('Refresh token verification failed:', error);
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid or expired refresh token');
  }

  const incomingHash = hashToken(refreshToken);
  const session = await sessionService.findSessionByHash(incomingHash);

  // Token Reuse Detection (Replay Attack)
  if (!session) {
    await sessionService.revokeAllUserSessions(decoded.userId);
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid or expired refresh token');
  }

  // Database Session Expiry verification
  if (session.expiresAt <= new Date()) {
    await sessionService.revokeSession(incomingHash);
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid or expired refresh token');
  }

  const user = await authRepository.findById(decoded.userId);
  if (!user) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid or expired refresh token');
  }

  const userClaims = {
    userId: user.id,
    email: user.email,
    isRoot: user.isRoot,
  };

  const newAccessToken = generateAccessToken(userClaims);
  const newRefreshToken = generateRefreshToken(userClaims);
  const newHash = hashToken(newRefreshToken);

  const newExpiresAt = new Date(Date.now() + getRefreshTokenExpirySeconds() * 1000);

  await sessionService.rotateSession(session.id, newHash, newExpiresAt);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    expiresIn: getAccessTokenExpirySeconds(),
  };
};

export const logout = async (refreshToken: string): Promise<void> => {
  const hash = hashToken(refreshToken);
  await sessionService.revokeSession(hash);
};

export const getProfile = async (userId: string): Promise<AuthUserPayload> => {
  const user = await authRepository.findById(userId);
  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isRoot: user.isRoot,
    createdAt: user.createdAt,
  };
};

export const resetPassword = async (email: string, newPassword: string): Promise<void> => {
  const user = await authRepository.findByEmail(email);
  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
  }

  const validation = validatePasswordAgainstPolicy(newPassword);
  if (!validation.isValid) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, validation.errors.join('. '));
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });
};
