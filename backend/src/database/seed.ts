import { ResultSetHeader } from "mysql2";
import { getConnection, closeDatabasePool } from "../config/database";

const DEFAULT_PASSWORD_HASH = "$2b$10$N9qo8uLOickgx2ZMRZo5i.ejQ6dogJjM90oCbGyF/F7kh/3GzdhGa";

type TenantSeed = {
  name: string;
  slug: string;
  plan: "starter" | "pro" | "enterprise";
};

const TENANTS: TenantSeed[] = [
  { name: "Acme Growth", slug: "acme-growth", plan: "pro" },
  { name: "Nimbus Labs", slug: "nimbus-labs", plan: "enterprise" },
  { name: "Northstar Commerce", slug: "northstar-commerce", plan: "starter" },
];

const EVENT_TYPES = ["auth", "billing", "usage", "integration", "feature"];
const EVENT_NAMES = [
  "User Signed In",
  "Subscription Updated",
  "Dashboard Viewed",
  "API Token Generated",
  "Report Exported",
  "Webhook Delivered",
  "Feature Flag Enabled",
  "Session Timeout",
];

const ACTIONS = [
  "user.created",
  "user.updated",
  "user.deleted",
  "role.assigned",
  "dashboard.viewed",
  "billing.invoice_paid",
  "settings.updated",
];

const USER_PLANS: Array<"free" | "pro" | "enterprise"> = ["free", "pro", "enterprise"];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 2): number {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(decimals));
}

function pick<T>(items: T[]): T {
  return items[randomInt(0, items.length - 1)];
}

function monthsBack(count: number): Date[] {
  const now = new Date();
  const months: Date[] = [];

  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    months.push(date);
  }

  return months;
}

function isoDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

async function truncateAllTables(): Promise<void> {
  const connection = await getConnection();
  try {
    await connection.query("SET FOREIGN_KEY_CHECKS = 0");
    await connection.query("TRUNCATE TABLE audit_logs");
    await connection.query("TRUNCATE TABLE events");
    await connection.query("TRUNCATE TABLE metrics");
    await connection.query("TRUNCATE TABLE user_roles");
    await connection.query("TRUNCATE TABLE refresh_tokens");
    await connection.query("TRUNCATE TABLE users");
    await connection.query("TRUNCATE TABLE roles");
    await connection.query("TRUNCATE TABLE tenants");
    await connection.query("SET FOREIGN_KEY_CHECKS = 1");
  } finally {
    connection.release();
  }
}

async function seed(): Promise<void> {
  await truncateAllTables();

  const connection = await getConnection();

  try {
    await connection.beginTransaction();

    const [adminRoleInsert] = await connection.execute<ResultSetHeader>(
      "INSERT INTO roles (name, description) VALUES (?, ?)",
      ["admin", "Tenant administrator with elevated privileges"]
    );
    const adminRoleId = adminRoleInsert.insertId;

    const [userRoleInsert] = await connection.execute<ResultSetHeader>(
      "INSERT INTO roles (name, description) VALUES (?, ?)",
      ["user", "Standard tenant user"]
    );
    const userRoleId = userRoleInsert.insertId;

    for (const tenant of TENANTS) {
      const [tenantInsert] = await connection.execute<ResultSetHeader>(
        "INSERT INTO tenants (name, slug, plan, status) VALUES (?, ?, ?, ?)",
        [tenant.name, tenant.slug, tenant.plan, "active"]
      );
      const tenantId = tenantInsert.insertId;

      const tenantUserIds: number[] = [];

      const [adminUserInsert] = await connection.execute<ResultSetHeader>(
        "INSERT INTO users (tenant_id, email, first_name, last_name, password_hash, plan, is_active, last_login_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          tenantId,
          `admin@${tenant.slug}.com`,
          "Admin",
          tenant.name.split(" ")[0],
          DEFAULT_PASSWORD_HASH,
          tenant.plan === "starter" ? "free" : tenant.plan,
          true,
          new Date(),
        ]
      );

      const adminUserId = adminUserInsert.insertId;
      tenantUserIds.push(adminUserId);

      await connection.execute(
        "INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES (?, ?, ?)",
        [adminUserId, adminRoleId, null]
      );

      const extraUsers = randomInt(8, 14);
      for (let i = 1; i <= extraUsers; i += 1) {
        const firstName = ["Liam", "Emma", "Noah", "Olivia", "Mason", "Sophia", "Ethan", "Ava"][
          randomInt(0, 7)
        ];
        const lastName = ["Brown", "Wilson", "Taylor", "Martin", "Anderson", "Thomas", "Moore", "Clark"][
          randomInt(0, 7)
        ];

        const [userInsert] = await connection.execute<ResultSetHeader>(
          "INSERT INTO users (tenant_id, email, first_name, last_name, password_hash, plan, is_active, last_login_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [
            tenantId,
            `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@${tenant.slug}.com`,
            firstName,
            lastName,
            DEFAULT_PASSWORD_HASH,
            pick(USER_PLANS),
            true,
            new Date(Date.now() - randomInt(1, 10) * 24 * 60 * 60 * 1000),
          ]
        );

        const userId = userInsert.insertId;
        tenantUserIds.push(userId);

        await connection.execute(
          "INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES (?, ?, ?)",
          [userId, userRoleId, adminUserId]
        );
      }

      const metricMonths = monthsBack(12);
      let totalUsers = tenantUserIds.length;
      let revenue = randomInt(12000, 28000);

      for (const month of metricMonths) {
        totalUsers += randomInt(1, 8);
        revenue += randomInt(1800, 5500);
        const activeSessions = randomInt(Math.floor(totalUsers * 0.45), Math.floor(totalUsers * 0.8));
        const churnRate = randomFloat(1.2, 7.8);

        await connection.execute(
          "INSERT INTO metrics (tenant_id, metric_date, total_users, revenue, active_sessions, churn_rate) VALUES (?, ?, ?, ?, ?, ?)",
          [tenantId, isoDateOnly(month), totalUsers, revenue, activeSessions, churnRate]
        );
      }

      const eventCount = randomInt(180, 260);
      for (let i = 0; i < eventCount; i += 1) {
        const eventType = pick(EVENT_TYPES);
        const eventName = pick(EVENT_NAMES);
        const userId = pick(tenantUserIds);
        const occurredAt = new Date(Date.now() - randomInt(1, 90) * 24 * 60 * 60 * 1000);

        await connection.execute(
          "INSERT INTO events (tenant_id, user_id, event_type, event_name, metadata, occurred_at) VALUES (?, ?, ?, ?, ?, ?)",
          [
            tenantId,
            userId,
            eventType,
            eventName,
            JSON.stringify({
              source: pick(["web", "mobile", "api"]),
              durationMs: randomInt(100, 5000),
              success: Math.random() > 0.1,
            }),
            occurredAt,
          ]
        );
      }

      const auditCount = randomInt(45, 70);
      for (let i = 0; i < auditCount; i += 1) {
        const action = pick(ACTIONS);
        const actorUserId = pick(tenantUserIds);
        const targetId = pick(tenantUserIds);

        await connection.execute(
          "INSERT INTO audit_logs (tenant_id, actor_user_id, action, target_type, target_id, details, ip_address, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            tenantId,
            actorUserId,
            action,
            "user",
            targetId,
            JSON.stringify({
              reason: pick([
                "bulk import",
                "manual update",
                "self-service action",
                "automated workflow",
              ]),
              severity: pick(["low", "medium", "high"]),
            }),
            `10.0.${randomInt(0, 255)}.${randomInt(1, 254)}`,
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            new Date(Date.now() - randomInt(1, 120) * 24 * 60 * 60 * 1000),
          ]
        );
      }
    }

    await connection.commit();

    console.log("Seed completed successfully.");
    console.log("Default seeded password for all users: password");
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
    await closeDatabasePool();
  }
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  closeDatabasePool().finally(() => process.exit(1));
});
