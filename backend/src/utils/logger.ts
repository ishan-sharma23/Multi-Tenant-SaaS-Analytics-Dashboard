import { env } from "../config/env";

type LogLevel = "error" | "warn" | "info" | "debug";

const levelRank: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

function shouldLog(level: LogLevel): boolean {
  return levelRank[level] <= levelRank[env.LOG_LEVEL];
}

function log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  if (!shouldLog(level)) {
    return;
  }

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };

  const output = JSON.stringify(entry);

  if (level === "error") {
    console.error(output);
    return;
  }

  if (level === "warn") {
    console.warn(output);
    return;
  }

  console.log(output);
}

export const logger = {
  error: (message: string, meta?: Record<string, unknown>) => log("error", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log("warn", message, meta),
  info: (message: string, meta?: Record<string, unknown>) => log("info", message, meta),
  debug: (message: string, meta?: Record<string, unknown>) => log("debug", message, meta),
};
