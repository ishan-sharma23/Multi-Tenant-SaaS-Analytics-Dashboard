import { ResultSetHeader, RowDataPacket } from "mysql2";
import { query, queryRows } from "../config/database";

type AdminUserRow = RowDataPacket & {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  plan: "free" | "pro" | "enterprise";
  is_active: number;
  created_at: Date;
  roles: string;
};

type RoleRow = RowDataPacket & {
  id: number;
};

export async function listTenantUsers(tenantId: number): Promise<AdminUserRow[]> {
  return queryRows<AdminUserRow>(
    `SELECT
      u.id,
      u.email,
      u.first_name,
      u.last_name,
      u.plan,
      u.is_active,
      u.created_at,
      GROUP_CONCAT(r.name) AS roles
     FROM users u
     INNER JOIN user_roles ur ON ur.user_id = u.id
     INNER JOIN roles r ON r.id = ur.role_id
     WHERE u.tenant_id = ?
       AND u.deleted_at IS NULL
     GROUP BY u.id
     ORDER BY u.created_at DESC`,
    [tenantId]
  );
}

export async function getRoleId(roleName: "admin" | "user"): Promise<number> {
  const rows = await queryRows<RoleRow>(
    `SELECT id
     FROM roles
     WHERE name = ?
     LIMIT 1`,
    [roleName]
  );

  if (!rows[0]) {
    throw new Error("Role not found");
  }

  return rows[0].id;
}

export async function updateUserRole(params: {
  tenantId: number;
  userId: number;
  roleId: number;
  assignedBy: number;
}): Promise<void> {
  await query<ResultSetHeader>(
    `DELETE ur
     FROM user_roles ur
     INNER JOIN users u ON u.id = ur.user_id
     WHERE ur.user_id = ?
       AND u.tenant_id = ?`,
    [params.userId, params.tenantId]
  );

  await query<ResultSetHeader>(
    `INSERT INTO user_roles (user_id, role_id, assigned_by)
     VALUES (?, ?, ?)`,
    [params.userId, params.roleId, params.assignedBy]
  );
}

export async function softDeleteTenantUser(params: {
  tenantId: number;
  userId: number;
}): Promise<void> {
  await query<ResultSetHeader>(
    `UPDATE users
     SET deleted_at = NOW(),
         is_active = false
     WHERE id = ?
       AND tenant_id = ?
       AND deleted_at IS NULL`,
    [params.userId, params.tenantId]
  );
}
