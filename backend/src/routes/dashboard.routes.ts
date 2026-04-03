import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const dashboardRouter = Router();

dashboardRouter.get("/metrics", requireAuth, dashboardController.getMetrics);
dashboardRouter.get("/charts", requireAuth, dashboardController.getCharts);
dashboardRouter.get("/activity", requireAuth, dashboardController.getActivity);

export default dashboardRouter;
