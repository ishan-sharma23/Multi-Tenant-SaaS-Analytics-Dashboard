import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/app-error";
import { env } from "../config/env";
import { logger } from "../utils/logger";

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error("request.failed", {
    requestId: req.requestId,
    path: req.originalUrl,
    method: req.method,
    error: err instanceof Error ? err.message : "Unknown error",
  });

  if (err instanceof ZodError) {
    const firstIssue = err.issues[0];
    res.status(400).json({
      success: false,
      error: firstIssue?.message ?? "Validation error",
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  if (err instanceof Error) {
    res.status(500).json({
      success: false,
      error: env.NODE_ENV === "production" ? "Internal server error" : err.message,
    });
    return;
  }

  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
}
