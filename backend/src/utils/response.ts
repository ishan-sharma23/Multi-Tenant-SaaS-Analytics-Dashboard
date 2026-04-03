import { Response } from "express";

export function sendSuccess<T>(
  res: Response,
  statusCode: number,
  data?: T,
  message?: string
): Response {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
}

export function sendError(res: Response, statusCode: number, error: string): Response {
  return res.status(statusCode).json({
    success: false,
    error,
  });
}
