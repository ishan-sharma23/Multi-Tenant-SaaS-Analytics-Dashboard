import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import {
  getActivityFeed,
  getMetricSnapshots,
  getPlanDistribution,
  getUserGrowthSeries,
} from "../models/dashboard.model";
import { sendSuccess } from "../utils/response";

function calcChange(current: number, previous: number): number {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return Number((((current - previous) / previous) * 100).toFixed(2));
}

const activityQuerySchema = z.object({
  eventType: z.string().trim().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(20),
});

export async function getMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tenantId = req.authUser?.tenantId;

    if (!tenantId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const [current, previous] = await getMetricSnapshots(tenantId, 2);

    const data = {
      totalUsers: {
        value: current?.total_users ?? 0,
        changePct: calcChange(current?.total_users ?? 0, previous?.total_users ?? 0),
      },
      revenue: {
        value: current?.revenue ?? 0,
        changePct: calcChange(current?.revenue ?? 0, previous?.revenue ?? 0),
      },
      activeSessions: {
        value: current?.active_sessions ?? 0,
        changePct: calcChange(current?.active_sessions ?? 0, previous?.active_sessions ?? 0),
      },
      churnRate: {
        value: current?.churn_rate ?? 0,
        changePct: calcChange(current?.churn_rate ?? 0, previous?.churn_rate ?? 0),
      },
      metricDate: current?.metric_date ?? null,
    };

    sendSuccess(res, 200, data, "Dashboard metrics fetched successfully");
  } catch (error) {
    next(error);
  }
}

export async function getCharts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tenantId = req.authUser?.tenantId;

    if (!tenantId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const [growthSeries, planDistribution] = await Promise.all([
      getUserGrowthSeries(tenantId),
      getPlanDistribution(tenantId),
    ]);

    const userGrowth = growthSeries.map((row) => ({
      month: row.metric_date,
      totalUsers: row.total_users,
    }));

    const revenueByMonth = growthSeries.map((row) => ({
      month: row.metric_date,
      revenue: row.revenue,
    }));

    const planSplit = planDistribution.map((row) => ({
      plan: row.plan,
      users: row.user_count,
    }));

    sendSuccess(
      res,
      200,
      {
        userGrowth,
        revenueByMonth,
        planSplit,
      },
      "Dashboard charts fetched successfully"
    );
  } catch (error) {
    next(error);
  }
}

export async function getActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tenantId = req.authUser?.tenantId;

    if (!tenantId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const query = activityQuerySchema.parse(req.query);

    const { rows, total } = await getActivityFeed({
      tenantId,
      eventType: query.eventType,
      startDate: query.startDate,
      endDate: query.endDate,
      page: query.page,
      pageSize: query.pageSize,
    });

    sendSuccess(
      res,
      200,
      {
        items: rows,
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          total,
          totalPages: Math.ceil(total / query.pageSize),
        },
      },
      "Activity feed fetched successfully"
    );
  } catch (error) {
    next(error);
  }
}
