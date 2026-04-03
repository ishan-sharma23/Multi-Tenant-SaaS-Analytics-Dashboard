import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { AuthTokenPayload } from "../types/auth";

function signToken(
  payload: AuthTokenPayload,
  secret: string,
  expiresIn: SignOptions["expiresIn"]
): string {
  const options: SignOptions = {
    expiresIn,
    subject: String(payload.userId),
  };

  return jwt.sign(payload, secret, options);
}

export function signAccessToken(payload: Omit<AuthTokenPayload, "tokenType">): string {
  return signToken(
    { ...payload, tokenType: "access" },
    env.JWT_ACCESS_SECRET,
    env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"]
  );
}

export function signRefreshToken(payload: Omit<AuthTokenPayload, "tokenType">): string {
  return signToken(
    { ...payload, tokenType: "refresh" },
    env.JWT_REFRESH_SECRET,
    env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"]
  );
}

function verifyToken(token: string, secret: string): AuthTokenPayload {
  const decoded = jwt.verify(token, secret);

  if (!decoded || typeof decoded === "string") {
    throw new Error("Invalid token payload");
  }

  const payload = decoded as JwtPayload & Partial<AuthTokenPayload>;

  if (
    typeof payload.userId !== "number" ||
    typeof payload.tenantId !== "number" ||
    typeof payload.email !== "string" ||
    !Array.isArray(payload.roles) ||
    (payload.tokenType !== "access" && payload.tokenType !== "refresh")
  ) {
    throw new Error("Malformed token payload");
  }

  return {
    userId: payload.userId,
    tenantId: payload.tenantId,
    email: payload.email,
    roles: payload.roles,
    tokenType: payload.tokenType,
  };
}

export function verifyAccessToken(token: string): AuthTokenPayload {
  const payload = verifyToken(token, env.JWT_ACCESS_SECRET);

  if (payload.tokenType !== "access") {
    throw new Error("Invalid access token");
  }

  return payload;
}

export function verifyRefreshToken(token: string): AuthTokenPayload {
  const payload = verifyToken(token, env.JWT_REFRESH_SECRET);

  if (payload.tokenType !== "refresh") {
    throw new Error("Invalid refresh token");
  }

  return payload;
}
