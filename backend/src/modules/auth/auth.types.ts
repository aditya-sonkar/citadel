export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RefreshInput {
  refreshToken: string;
}

export interface AuthUserPayload {
  id: string;
  name: string;
  email: string;
  isRoot: boolean;
  createdAt: Date;
}

export interface AuthResponsePayload {
  user: AuthUserPayload;
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // in seconds
}
