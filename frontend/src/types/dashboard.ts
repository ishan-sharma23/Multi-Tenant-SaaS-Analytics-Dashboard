export interface KpiMetric {
  value: number;
  changePct: number;
}

export interface DashboardMetrics {
  totalUsers: KpiMetric;
  revenue: KpiMetric;
  activeSessions: KpiMetric;
  churnRate: KpiMetric;
  metricDate: string | null;
}

export interface GrowthPoint {
  month: string;
  totalUsers: number;
}

export interface RevenuePoint {
  month: string;
  revenue: number;
}

export interface PlanSplitPoint {
  plan: string;
  users: number;
}

export interface DashboardCharts {
  userGrowth: GrowthPoint[];
  revenueByMonth: RevenuePoint[];
  planSplit: PlanSplitPoint[];
}

export interface ActivityItem {
  id: number;
  event_type: string;
  event_name: string;
  metadata: string | null;
  occurred_at: string;
  user_email: string | null;
}

export interface ActivityResponse {
  items: ActivityItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
