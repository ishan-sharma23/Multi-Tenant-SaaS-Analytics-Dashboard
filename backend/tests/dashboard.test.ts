import request from "supertest";
import app from "../src/app";
import * as dashboardModel from "../src/models/dashboard.model";
import * as jwtUtils from "../src/utils/jwt";

jest.mock("../src/models/dashboard.model");
jest.mock("../src/utils/jwt");

describe("Dashboard API", () => {
  const mockedDashboardModel = jest.mocked(dashboardModel);
  const mockedJwtUtils = jest.mocked(jwtUtils);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/dashboard/metrics", () => {
    it("should return metrics for authenticated user", async () => {
      mockedJwtUtils.verifyAccessToken.mockReturnValue({
        userId: 10,
        tenantId: 1,
        email: "user@acme-growth.com",
        roles: ["user"],
        tokenType: "access",
      });

      mockedDashboardModel.getMetricSnapshots.mockResolvedValue([
        {
          metric_date: "2026-03-01",
          total_users: 140,
          revenue: 24000,
          active_sessions: 87,
          churn_rate: 3.1,
        },
        {
          metric_date: "2026-02-01",
          total_users: 129,
          revenue: 22100,
          active_sessions: 80,
          churn_rate: 3.8,
        },
      ] as never);

      const response = await request(app)
        .get("/api/dashboard/metrics")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalUsers.value).toBe(140);
    });

    it("should reject unauthenticated request", async () => {
      const response = await request(app).get("/api/dashboard/metrics");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Authentication required");
    });
  });
});
