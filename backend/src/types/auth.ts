export type RoleName = "admin" | "user";

export interface AuthTokenPayload {
  userId: number;
  tenantId: number;
  email: string;
  roles: RoleName[];
  tokenType: "access" | "refresh";
  tokenId?: string;
}

export interface AuthUser {
  id: number;
  tenantId: number;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roles: RoleName[];
}

export interface RegisterInput {
  tenantSlug: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface LoginInput {
  tenantSlug: string;
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: Omit<AuthUser, "isActive">;
  tokens: AuthTokens;
}
