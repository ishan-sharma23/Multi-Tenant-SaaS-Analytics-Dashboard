import app from "./app";
import { env } from "./config/env";
import { testDatabaseConnection } from "./config/database";
import { logger } from "./utils/logger";

async function start(): Promise<void> {
  await testDatabaseConnection();

  app.listen(env.PORT, () => {
    logger.info("server.started", { port: env.PORT, env: env.NODE_ENV });
  });
}

start().catch((error) => {
  logger.error("server.start_failed", {
    error: error instanceof Error ? error.message : "Unknown startup error",
  });
  process.exit(1);
});
