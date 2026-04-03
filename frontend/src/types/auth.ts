export type UserRole = "admin" | "user";

export interface AuthUser {
  id: number;
  tenantId: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: UserRole[];
}

export interface AuthTokensResponse {
  accessToken: string;
}

export interface AuthApiPayload {
  user: AuthUser;
  accessToken: string;
}
