import api from "./axios";
import { ActivityResponse, DashboardCharts, DashboardMetrics } from "../types/dashboard";

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export async function fetchMetrics(): Promise<DashboardMetrics> {
  const response = await api.get<ApiEnvelope<DashboardMetrics>>("/dashboard/metrics");
  return response.data.data;
}

export async function fetchCharts(): Promise<DashboardCharts> {
  const response = await api.get<ApiEnvelope<DashboardCharts>>("/dashboard/charts");
  return response.data.data;
}

export async function fetchActivity(params: {
  page: number;
  pageSize: number;
  eventType?: string;
  startDate?: string;
  endDate?: string;
}): Promise<ActivityResponse> {
  const response = await api.get<ApiEnvelope<ActivityResponse>>("/dashboard/activity", {
    params,
  });
  return response.data.data;
}
