import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { fetchActivity, fetchCharts, fetchMetrics } from "../api/dashboard";
import KpiCard from "../components/KpiCard";
import SkeletonCard from "../components/SkeletonCard";
import ActivityFeedTable from "../components/ActivityFeedTable";

const PIE_COLORS = ["#0d9488", "#ff6b00", "#be123c"];

export default function DashboardPage(): JSX.Element {
  const [eventType, setEventType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(120);

  const metricsQuery = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: fetchMetrics,
  });

  const chartsQuery = useQuery({
    queryKey: ["dashboard-charts"],
    queryFn: fetchCharts,
  });

  const activityQuery = useQuery({
    queryKey: ["dashboard-activity", eventType, startDate, endDate, page, pageSize],
    queryFn: () => fetchActivity({ eventType, startDate, endDate, page, pageSize }),
  });

  const kpiData = useMemo(() => {
    const data = metricsQuery.data;

    if (!data) {
      return [];
    }

    return [
      { title: "Total Users", value: data.totalUsers.value.toLocaleString(), change: data.totalUsers.changePct },
      { title: "Revenue", value: `$${data.revenue.value.toLocaleString()}`, change: data.revenue.changePct },
      {
        title: "Active Sessions",
        value: data.activeSessions.value.toLocaleString(),
        change: data.activeSessions.changePct,
      },
      { title: "Churn Rate", value: `${data.churnRate.value.toFixed(2)}%`, change: data.churnRate.changePct },
    ];
  }, [metricsQuery.data]);

  const onFilterReset = useCallback(() => {
    setEventType("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  }, []);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricsQuery.isLoading && Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} />)}
        {!metricsQuery.isLoading &&
          kpiData.map((item) => (
            <KpiCard key={item.title} title={item.title} value={item.value} changePct={item.change} />
          ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-2xl border border-white/50 bg-white/85 p-5 shadow-panel">
          <h3 className="font-display text-xl font-semibold">User Growth (12 months)</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartsQuery.data?.userGrowth ?? []}>
                <CartesianGrid strokeDasharray="4 4" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="totalUsers" stroke="#0d9488" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-2xl border border-white/50 bg-white/85 p-5 shadow-panel">
          <h3 className="font-display text-xl font-semibold">Revenue by Month</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartsQuery.data?.revenueByMonth ?? []}>
                <CartesianGrid strokeDasharray="4 4" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#ff6b00" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_2fr]">
        <article className="rounded-2xl border border-white/50 bg-white/85 p-5 shadow-panel">
          <h3 className="font-display text-xl font-semibold">User Plan Mix</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Legend />
                <Pie data={chartsQuery.data?.planSplit ?? []} dataKey="users" nameKey="plan" outerRadius={90}>
                  {(chartsQuery.data?.planSplit ?? []).map((entry, index) => (
                    <Cell key={entry.plan} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>

        <div className="space-y-3 rounded-2xl border border-white/50 bg-white/70 p-4 shadow-panel">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input
              value={eventType}
              onChange={(event) => {
                setEventType(event.target.value);
                setPage(1);
              }}
              placeholder="Event type"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={startDate}
              onChange={(event) => {
                setStartDate(event.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={endDate}
              onChange={(event) => {
                setEndDate(event.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={onFilterReset}
              className="rounded-xl bg-slate-800 px-3 py-2 text-sm font-semibold text-white"
            >
              Reset Filters
            </button>
          </div>

          {activityQuery.isLoading ? (
            <SkeletonCard />
          ) : (
            <>
              <ActivityFeedTable items={activityQuery.data?.items ?? []} />
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((current) => Math.max(current - 1, 1))}
                    className="rounded-lg bg-white px-3 py-1 disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    disabled={page >= (activityQuery.data?.pagination.totalPages ?? 1)}
                    onClick={() => setPage((current) => current + 1)}
                    className="rounded-lg bg-white px-3 py-1 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span>Rows:</span>
                  <select
                    className="rounded-lg border border-slate-200 px-2 py-1"
                    value={pageSize}
                    onChange={(event) => {
                      setPageSize(Number(event.target.value));
                      setPage(1);
                    }}
                  >
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={120}>120</option>
                    <option value={200}>200</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
