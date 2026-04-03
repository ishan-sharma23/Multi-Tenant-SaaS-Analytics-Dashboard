import { RowDataPacket } from "mysql2";
import { queryRows } from "../config/database";

type MetricSummaryRow = RowDataPacket & {
  metric_date: string;
  total_users: number;
  revenue: number;
  active_sessions: number;
  churn_rate: number;
};

type PlanDistributionRow = RowDataPacket & {
  plan: "free" | "pro" | "enterprise";
  user_count: number;
};

type ActivityRow = RowDataPacket & {
  id: number;
  event_type: string;
  event_name: string;
  metadata: string | null;
  occurred_at: Date;
  user_email: string | null;
};

type CountRow = RowDataPacket & {
  total: number;
};

export async function getMetricSnapshots(tenantId: number, limit = 2): Promise<MetricSummaryRow[]> {
  return queryRows<MetricSummaryRow>(
    `SELECT metric_date, total_users, revenue, active_sessions, churn_rate
     FROM metrics
     WHERE tenant_id = ?
     ORDER BY metric_date DESC
     LIMIT ?`,
    [tenantId, limit]
  );
}

export async function getUserGrowthSeries(tenantId: number): Promise<MetricSummaryRow[]> {
  return queryRows<MetricSummaryRow>(
    `SELECT metric_date, total_users, revenue, active_sessions, churn_rate
     FROM metrics
     WHERE tenant_id = ?
     ORDER BY metric_date ASC`,
    [tenantId]
  );
}

export async function getPlanDistribution(tenantId: number): Promise<PlanDistributionRow[]> {
  return queryRows<PlanDistributionRow>(
    `SELECT plan, COUNT(*) AS user_count
     FROM users
     WHERE tenant_id = ?
       AND deleted_at IS NULL
     GROUP BY plan
     ORDER BY user_count DESC`,
    [tenantId]
  );
}

export async function getActivityFeed(params: {
  tenantId: number;
  eventType?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  pageSize: number;
}): Promise<{ rows: ActivityRow[]; total: number }> {
  const whereClauses: string[] = ["e.tenant_id = ?"];
  const values: Array<string | number> = [params.tenantId];

  if (params.eventType) {
    whereClauses.push("e.event_type = ?");
    values.push(params.eventType);
  }

  if (params.startDate) {
    whereClauses.push("e.occurred_at >= ?");
    values.push(`${params.startDate} 00:00:00`);
  }

  if (params.endDate) {
    whereClauses.push("e.occurred_at <= ?");
    values.push(`${params.endDate} 23:59:59`);
  }

  const whereSql = whereClauses.join(" AND ");
  const offset = (params.page - 1) * params.pageSize;

  const rows = await queryRows<ActivityRow>(
    `SELECT
      e.id,
      e.event_type,
      e.event_name,
      CAST(e.metadata AS CHAR) AS metadata,
      e.occurred_at,
      u.email AS user_email
     FROM events e
     LEFT JOIN users u ON u.id = e.user_id
     WHERE ${whereSql}
     ORDER BY e.occurred_at DESC
     LIMIT ? OFFSET ?`,
    [...values, params.pageSize, offset]
  );

  const totalRows = await queryRows<CountRow>(
    `SELECT COUNT(*) AS total
     FROM events e
     WHERE ${whereSql}`,
    values
  );

  return {
    rows,
    total: totalRows[0]?.total ?? 0,
  };
}
