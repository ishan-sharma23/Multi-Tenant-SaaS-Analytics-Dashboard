import { Express } from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Multi-Tenant SaaS Analytics Dashboard API",
      version: "1.0.0",
      description: "Production-ready API for auth, user profile, dashboard analytics, and admin management.",
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Local development",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        ApiSuccess: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { type: "object", nullable: true },
            message: { type: "string", nullable: true },
          },
        },
        ApiError: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: { type: "string", example: "Invalid credentials" },
          },
        },
      },
    },
    paths: {
      "/api/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a new user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["tenantSlug", "email", "firstName", "lastName", "password"],
                  properties: {
                    tenantSlug: { type: "string" },
                    email: { type: "string", format: "email" },
                    firstName: { type: "string" },
                    lastName: { type: "string" },
                    password: { type: "string", minLength: 8 },
                  },
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Registered",
            },
          },
        },
      },
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Log in a user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["tenantSlug", "email", "password"],
                  properties: {
                    tenantSlug: { type: "string" },
                    email: { type: "string", format: "email" },
                    password: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Login success" },
            "401": { description: "Invalid credentials" },
          },
        },
      },
      "/api/auth/refresh": {
        post: {
          tags: ["Auth"],
          summary: "Refresh access token",
          requestBody: {
            required: false,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    refreshToken: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Token refreshed" },
            "401": { description: "Refresh token missing or invalid" },
          },
        },
      },
      "/api/users/me": {
        get: {
          tags: ["Users"],
          summary: "Get current user profile",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": { description: "Profile returned" },
          },
        },
        put: {
          tags: ["Users"],
          summary: "Update current user profile",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["firstName", "lastName", "plan"],
                  properties: {
                    firstName: { type: "string" },
                    lastName: { type: "string" },
                    plan: { type: "string", enum: ["free", "pro", "enterprise"] },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Profile updated" },
          },
        },
        delete: {
          tags: ["Users"],
          summary: "Delete current user profile",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": { description: "Profile deleted" },
          },
        },
      },
      "/api/dashboard/metrics": {
        get: {
          tags: ["Dashboard"],
          summary: "Get KPI metrics",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": { description: "Metrics returned" },
          },
        },
      },
      "/api/dashboard/charts": {
        get: {
          tags: ["Dashboard"],
          summary: "Get chart data",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": { description: "Chart data returned" },
          },
        },
      },
      "/api/dashboard/activity": {
        get: {
          tags: ["Dashboard"],
          summary: "Get activity feed",
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: "query", name: "eventType", schema: { type: "string" } },
            { in: "query", name: "startDate", schema: { type: "string", format: "date" } },
            { in: "query", name: "endDate", schema: { type: "string", format: "date" } },
            { in: "query", name: "page", schema: { type: "integer", minimum: 1 } },
            { in: "query", name: "pageSize", schema: { type: "integer", minimum: 1, maximum: 200 } },
          ],
          responses: {
            "200": { description: "Activity returned" },
          },
        },
      },
      "/api/admin/users": {
        get: {
          tags: ["Admin"],
          summary: "List users for tenant",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": { description: "Users returned" },
            "403": { description: "Forbidden" },
          },
        },
      },
      "/api/admin/users/{id}/role": {
        put: {
          tags: ["Admin"],
          summary: "Update a user role",
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "integer" } },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["role"],
                  properties: {
                    role: { type: "string", enum: ["admin", "user"] },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Role updated" },
          },
        },
      },
      "/api/admin/users/{id}": {
        delete: {
          tags: ["Admin"],
          summary: "Delete a user",
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "integer" } },
          ],
          responses: {
            "200": { description: "User deleted" },
          },
        },
      },
    },
  },
  apis: [],
});

export function setupSwagger(app: Express): void {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
