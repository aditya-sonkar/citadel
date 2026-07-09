import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { TOKEN_TYPES } from './constants';

export interface JwtPayload {
  userId: string;
  email: string;
  isRoot: boolean;
}

export interface TokenPayload extends JwtPayload {
  type: typeof TOKEN_TYPES.ACCESS | typeof TOKEN_TYPES.REFRESH;
}

export const generateAccessToken = (payload: JwtPayload): string => {
  const tokenPayload: TokenPayload = {
    ...payload,
    type: TOKEN_TYPES.ACCESS,
  };
  return jwt.sign(tokenPayload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY as any,
  });
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  const tokenPayload: TokenPayload = {
    ...payload,
    type: TOKEN_TYPES.REFRESH,
  };
  return jwt.sign(tokenPayload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY as any,
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
  if (decoded.type !== TOKEN_TYPES.ACCESS) {
    throw new Error('Invalid token type: Expected access token');
  }
  return decoded;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
  if (decoded.type !== TOKEN_TYPES.REFRESH) {
    throw new Error('Invalid token type: Expected refresh token');
  }
  return decoded;
};
