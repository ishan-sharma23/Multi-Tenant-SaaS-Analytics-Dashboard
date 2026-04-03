import { ResultSetHeader, RowDataPacket } from "mysql2";
import { query, queryRows } from "../config/database";
import { AuthUser, RoleName } from "../types/auth";

type TenantRow = RowDataPacket & {
  id: number;
  slug: string;
  status: "active" | "suspended" | "cancelled";
};

type RoleRow = RowDataPacket & {
  id: number;
  name: RoleName;
};

type AuthUserRow = RowDataPacket & {
  id: number;
  tenant_id: number;
  email: string;
  first_name: string;
  last_name: string;
  password_hash: string;
  is_active: number;
  roles: string;
};

export interface AuthUserWithPassword extends AuthUser {
  passwordHash: string;
}

export async function findTenantBySlug(slug: string): Promise<TenantRow | null> {
  const rows = await queryRows<TenantRow>(
    `SELECT id, slug, status
     FROM tenants
     WHERE slug = ?
     LIMIT 1`,
    [slug]
  );

  return rows[0] ?? null;
}

export async function createTenant(params: {
  name: string;
  slug: string;
  plan?: "starter" | "pro" | "enterprise";
}): Promise<number> {
  const result = await query<ResultSetHeader>(
    `INSERT INTO tenants (name, slug, plan, status)
     VALUES (?, ?, ?, ?)`,
    [params.name, params.slug, params.plan ?? "starter", "active"]
  );

  return result.insertId;
}

export async function getRoleIdByName(roleName: RoleName): Promise<number> {
  const rows = await queryRows<RoleRow>(
    `SELECT id, name
     FROM roles
     WHERE name = ?
     LIMIT 1`,
    [roleName]
  );

  if (!rows[0]) {
    throw new Error(`Role not found: ${roleName}`);
  }

  return rows[0].id;
}

export async function createUser(params: {
  tenantId: number;
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
}): Promise<number> {
  const result = await query<ResultSetHeader>(
    `INSERT INTO users (
      tenant_id,
      email,
      first_name,
      last_name,
      password_hash,
      is_active
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    [params.tenantId, params.email, params.firstName, params.lastName, params.passwordHash, true]
  );

  return result.insertId;
}

export async function assignRoleToUser(params: {
  userId: number;
  roleId: number;
  assignedBy?: number | null;
}): Promise<void> {
  await query<ResultSetHeader>(
    `INSERT INTO user_roles (user_id, role_id, assigned_by)
     VALUES (?, ?, ?)`,
    [params.userId, params.roleId, params.assignedBy ?? null]
  );
}

export async function findUserByTenantAndEmail(params: {
  tenantSlug: string;
  email: string;
}): Promise<AuthUserWithPassword | null> {
  const rows = await queryRows<AuthUserRow>(
    `SELECT
      u.id,
      u.tenant_id,
      u.email,
      u.first_name,
      u.last_name,
      u.password_hash,
      u.is_active,
      GROUP_CONCAT(r.name) AS roles
     FROM users u
     INNER JOIN tenants t ON t.id = u.tenant_id
     INNER JOIN user_roles ur ON ur.user_id = u.id
     INNER JOIN roles r ON r.id = ur.role_id
     WHERE t.slug = ?
       AND u.email = ?
       AND u.deleted_at IS NULL
     GROUP BY u.id
     LIMIT 1`,
    [params.tenantSlug, params.email]
  );

  if (!rows[0]) {
    return null;
  }

  const row = rows[0];

  return {
    id: row.id,
    tenantId: row.tenant_id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    passwordHash: row.password_hash,
    isActive: Boolean(row.is_active),
    roles: row.roles.split(",") as RoleName[],
  };
}

export async function findUserById(userId: number): Promise<AuthUser | null> {
  const rows = await queryRows<AuthUserRow>(
    `SELECT
      u.id,
      u.tenant_id,
      u.email,
      u.first_name,
      u.last_name,
      u.password_hash,
      u.is_active,
      GROUP_CONCAT(r.name) AS roles
     FROM users u
     INNER JOIN user_roles ur ON ur.user_id = u.id
     INNER JOIN roles r ON r.id = ur.role_id
     WHERE u.id = ?
       AND u.deleted_at IS NULL
     GROUP BY u.id
     LIMIT 1`,
    [userId]
  );

  if (!rows[0]) {
    return null;
  }

  const row = rows[0];

  return {
    id: row.id,
    tenantId: row.tenant_id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    isActive: Boolean(row.is_active),
    roles: row.roles.split(",") as RoleName[],
  };
}
