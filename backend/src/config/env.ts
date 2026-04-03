import { config as loadEnv } from "dotenv";
import { z } from "zod";

loadEnv();

const numberFromString = z
  .string()
  .trim()
  .regex(/^\d+$/, "Must be a valid number")
  .transform((value) => Number(value));

const booleanFromString = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: numberFromString.default("4000").pipe(z.number().int().min(1).max(65535)),

  DB_HOST: z.string().trim().min(1, "DB_HOST is required"),
  DB_PORT: numberFromString.default("3306").pipe(z.number().int().min(1).max(65535)),
  DB_USER: z.string().trim().min(1, "DB_USER is required"),
  DB_PASSWORD: z.string().min(1, "DB_PASSWORD is required"),
  DB_NAME: z.string().trim().min(1, "DB_NAME is required"),
  DB_CONNECTION_LIMIT: numberFromString.default("10").pipe(z.number().int().min(1).max(100)),
  DB_QUEUE_LIMIT: numberFromString.default("0").pipe(z.number().int().min(0)),

  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  JWT_ACCESS_EXPIRES_IN: z.string().trim().min(1).default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().trim().min(1).default("7d"),

  CORS_ORIGIN: z.string().trim().min(1, "CORS_ORIGIN is required"),

  RATE_LIMIT_WINDOW_MS: numberFromString.default("900000").pipe(z.number().int().min(1000)),
  RATE_LIMIT_MAX_REQUESTS: numberFromString.default("100").pipe(z.number().int().min(1)),

  COOKIE_SECURE: booleanFromString.default("false"),
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const errorOutput = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  throw new Error(`Invalid environment variables:\n${errorOutput}`);
}

export const env = parsed.data;

export type AppEnv = typeof env;
