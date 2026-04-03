import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { sendError } from "../utils/response";
import { RoleName } from "../types/auth";

function extractBearerToken(authHeader?: string): string | null {
  if (!authHeader) {
    return null;
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      sendError(res, 401, "Authentication required");
      return;
    }

    const payload = verifyAccessToken(token);

    req.authUser = {
      userId: payload.userId,
      tenantId: payload.tenantId,
      email: payload.email,
      roles: payload.roles,
    };

    next();
  } catch {
    sendError(res, 401, "Invalid or expired access token");
  }
}

export function requireRole(allowedRoles: RoleName[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.authUser) {
      sendError(res, 401, "Authentication required");
      return;
    }

    const hasRole = req.authUser.roles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      sendError(res, 403, "Forbidden");
      return;
    }

    next();
  };
}
