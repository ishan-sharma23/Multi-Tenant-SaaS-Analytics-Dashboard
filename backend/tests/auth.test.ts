import request from "supertest";
import app from "../src/app";
import * as authModel from "../src/models/auth.model";
import * as passwordUtils from "../src/utils/password";

jest.mock("../src/models/auth.model");
jest.mock("../src/utils/password");

describe("Auth API", () => {
  const mockedAuthModel = jest.mocked(authModel);
  const mockedPasswordUtils = jest.mocked(passwordUtils);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("should register a user successfully", async () => {
      mockedAuthModel.findTenantBySlug.mockResolvedValue({
        id: 1,
        slug: "acme-growth",
        status: "active",
      } as never);
      mockedAuthModel.findUserByTenantAndEmail.mockResolvedValue(null);
      mockedPasswordUtils.hashPassword.mockResolvedValue("hashed-password");
      mockedAuthModel.createUser.mockResolvedValue(100);
      mockedAuthModel.getRoleIdByName.mockResolvedValue(2);
      mockedAuthModel.assignRoleToUser.mockResolvedValue();
      mockedAuthModel.findUserById.mockResolvedValue({
        id: 100,
        tenantId: 1,
        email: "new@acme-growth.com",
        firstName: "New",
        lastName: "User",
        isActive: true,
        roles: ["user"],
      });

      const response = await request(app).post("/api/auth/register").send({
        tenantSlug: "acme-growth",
        email: "new@acme-growth.com",
        firstName: "New",
        lastName: "User",
        password: "password123",
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe("new@acme-growth.com");
      expect(response.body.data.accessToken).toEqual(expect.any(String));
    });

    it("should return validation errors", async () => {
      const response = await request(app).post("/api/auth/register").send({
        tenantSlug: "",
        email: "not-an-email",
        firstName: "",
        lastName: "",
        password: "123",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toEqual(expect.any(String));
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login successfully", async () => {
      mockedAuthModel.findUserByTenantAndEmail.mockResolvedValue({
        id: 2,
        tenantId: 1,
        email: "admin@acme-growth.com",
        firstName: "Admin",
        lastName: "User",
        passwordHash: "hashed",
        isActive: true,
        roles: ["admin"],
      });
      mockedPasswordUtils.comparePassword.mockResolvedValue(true);

      const response = await request(app).post("/api/auth/login").send({
        tenantSlug: "acme-growth",
        email: "admin@acme-growth.com",
        password: "password",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.roles).toContain("admin");
      expect(response.body.data.accessToken).toEqual(expect.any(String));
    });

    it("should return unauthorized for wrong password", async () => {
      mockedAuthModel.findUserByTenantAndEmail.mockResolvedValue({
        id: 2,
        tenantId: 1,
        email: "admin@acme-growth.com",
        firstName: "Admin",
        lastName: "User",
        passwordHash: "hashed",
        isActive: true,
        roles: ["admin"],
      });
      mockedPasswordUtils.comparePassword.mockResolvedValue(false);

      const response = await request(app).post("/api/auth/login").send({
        tenantSlug: "acme-growth",
        email: "admin@acme-growth.com",
        password: "wrong-password",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Invalid credentials");
    });
  });
});
