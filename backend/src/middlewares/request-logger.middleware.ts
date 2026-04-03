import { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import { logger } from "../utils/logger";

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const requestId = crypto.randomUUID();
  req.requestId = requestId;

  const start = Date.now();

  res.on("finish", () => {
    logger.info("request.completed", {
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - start,
      ip: req.ip,
    });
  });

  next();
}
