import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { testDatabaseConnection } from "./config/database";
import { env } from "./config/env";
import { setupSwagger } from "./config/swagger";
import { apiRateLimiter } from "./middlewares/rate-limit.middleware";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";
import { requestLogger } from "./middlewares/request-logger.middleware";
import authRouter from "./routes/auth.routes";
import dashboardRouter from "./routes/dashboard.routes";
import userRouter from "./routes/user.routes";
import adminRouter from "./routes/admin.routes";

const app = express();

// App runs behind nginx in docker, so trust one proxy hop for correct client IP handling.
app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(requestLogger);
app.use(apiRateLimiter);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

setupSwagger(app);

app.get("/health", (_req, res) => {
  res.status(200).json({ success: true, message: "OK" });
});

app.get("/ready", async (_req, res) => {
  try {
    await testDatabaseConnection();
    res.status(200).json({ success: true, message: "READY" });
  } catch {
    res.status(503).json({ success: false, error: "Database not ready" });
  }
});

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/admin", adminRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
