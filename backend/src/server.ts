import app from "./app";
import { env } from "./config/env";
import { testDatabaseConnection } from "./config/database";

async function start(): Promise<void> {
  await testDatabaseConnection();

  app.listen(env.PORT, () => {
    console.log(`Backend API listening on port ${env.PORT}`);
  });
}

start().catch((error) => {
  console.error("Failed to start backend:", error);
  process.exit(1);
});
