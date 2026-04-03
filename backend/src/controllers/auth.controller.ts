import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import * as authService from "../services/auth.service";
import { sendSuccess } from "../utils/response";
import { env } from "../config/env";

const registerSchema = z.object({
  tenantSlug: z.string().trim().min(2).max(140),
  email: z.string().trim().email(),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  tenantSlug: z.string().trim().min(2).max(140),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1).optional(),
});

function setRefreshCookie(res: Response, refreshToken: string): void {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/auth/refresh",
  });
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const payload = registerSchema.parse(req.body);
    const result = await authService.register(payload);

    setRefreshCookie(res, result.tokens.refreshToken);

    sendSuccess(res, 201, {
      user: result.user,
      accessToken: result.tokens.accessToken,
    }, "User registered successfully");
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const payload = loginSchema.parse(req.body);
    const result = await authService.login(payload);

    setRefreshCookie(res, result.tokens.refreshToken);

    sendSuccess(res, 200, {
      user: result.user,
      accessToken: result.tokens.accessToken,
    }, "Login successful");
  } catch (error) {
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = refreshSchema.parse(req.body ?? {});
    const refreshToken = body.refreshToken || req.cookies?.refreshToken;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        error: "Refresh token is required",
      });
      return;
    }

    const tokens = await authService.refresh(refreshToken);
    setRefreshCookie(res, tokens.refreshToken);

    sendSuccess(
      res,
      200,
      {
        accessToken: tokens.accessToken,
      },
      "Access token refreshed"
    );
  } catch (error) {
    next(error);
  }
}
