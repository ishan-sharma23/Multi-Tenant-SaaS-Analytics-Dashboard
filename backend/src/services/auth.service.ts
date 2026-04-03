import {
  assignRoleToUser,
  createUser,
  findTenantBySlug,
  findUserById,
  findUserByTenantAndEmail,
  getRoleIdByName,
} from "../models/auth.model";
import {
  createRefreshTokenRecord,
  findUsableRefreshTokenByHash,
  revokeRefreshTokenByHash,
} from "../models/refresh-token.model";
import { LoginInput, AuthResponse, RegisterInput } from "../types/auth";
import {
  getTokenExpirationDate,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { comparePassword, hashPassword } from "../utils/password";
import { AppError } from "../utils/app-error";
import { hashToken } from "../utils/token";
import crypto from "crypto";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function sanitizeUser(user: {
  id: number;
  tenantId: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: ("admin" | "user")[];
}) {
  return {
    id: user.id,
    tenantId: user.tenantId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    roles: user.roles,
  };
}

async function issueTokens(user: {
  id: number;
  tenantId: number;
  email: string;
  roles: ("admin" | "user")[];
}): Promise<AuthResponse["tokens"]> {
  const tokenPayload = {
    userId: user.id,
    tenantId: user.tenantId,
    email: user.email,
    roles: user.roles,
  };

  const refreshTokenId = crypto.randomUUID();
  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken(tokenPayload, refreshTokenId);
  const refreshTokenHash = hashToken(refreshToken);
  const refreshTokenExpiresAt = getTokenExpirationDate(refreshToken);

  await createRefreshTokenRecord({
    userId: user.id,
    tokenId: refreshTokenId,
    tokenHash: refreshTokenHash,
    expiresAt: refreshTokenExpiresAt,
  });

  return {
    accessToken,
    refreshToken,
  };
}

export async function register(registerInput: RegisterInput): Promise<AuthResponse> {
  const tenant = await findTenantBySlug(registerInput.tenantSlug);

  if (!tenant || tenant.status !== "active") {
    throw new AppError("Tenant not found or inactive", 404);
  }

  const existingUser = await findUserByTenantAndEmail({
    tenantSlug: registerInput.tenantSlug,
    email: normalizeEmail(registerInput.email),
  });

  if (existingUser) {
    throw new AppError("A user with this email already exists for this tenant", 409);
  }

  const passwordHash = await hashPassword(registerInput.password);

  const userId = await createUser({
    tenantId: tenant.id,
    email: normalizeEmail(registerInput.email),
    firstName: registerInput.firstName.trim(),
    lastName: registerInput.lastName.trim(),
    passwordHash,
  });

  const userRoleId = await getRoleIdByName("user");
  await assignRoleToUser({
    userId,
    roleId: userRoleId,
    assignedBy: null,
  });

  const createdUser = await findUserById(userId);

  if (!createdUser) {
    throw new AppError("Unable to load created user", 500);
  }

  return {
    user: sanitizeUser(createdUser),
    tokens: await issueTokens(createdUser),
  };
}

export async function login(loginInput: LoginInput): Promise<AuthResponse> {
  const user = await findUserByTenantAndEmail({
    tenantSlug: loginInput.tenantSlug,
    email: normalizeEmail(loginInput.email),
  });

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  if (!user.isActive) {
    throw new AppError("User account is disabled", 403);
  }

  const passwordValid = await comparePassword(loginInput.password, user.passwordHash);

  if (!passwordValid) {
    throw new AppError("Invalid credentials", 401);
  }

  return {
    user: sanitizeUser(user),
    tokens: await issueTokens(user),
  };
}

export async function refresh(refreshToken: string): Promise<AuthResponse["tokens"]> {
  const payload = verifyRefreshToken(refreshToken);
  const currentRefreshTokenHash = hashToken(refreshToken);

  const usableToken = await findUsableRefreshTokenByHash(currentRefreshTokenHash);

  if (!usableToken || usableToken.user_id !== payload.userId) {
    throw new AppError("Refresh token is invalid or expired", 401);
  }

  const user = await findUserById(payload.userId);

  if (!user || !user.isActive) {
    throw new AppError("User not found or inactive", 401);
  }

  const nextTokens = await issueTokens(user);

  await revokeRefreshTokenByHash({
    tokenHash: currentRefreshTokenHash,
    replacedByTokenId: verifyRefreshToken(nextTokens.refreshToken).tokenId,
  });

  return nextTokens;
}

export async function logout(refreshToken?: string): Promise<void> {
  if (!refreshToken) {
    return;
  }

  await revokeRefreshTokenByHash({
    tokenHash: hashToken(refreshToken),
  });
}
