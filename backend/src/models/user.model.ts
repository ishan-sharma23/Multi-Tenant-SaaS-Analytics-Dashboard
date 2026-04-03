import { ResultSetHeader, RowDataPacket } from "mysql2";
import { query, queryRows } from "../config/database";

type UserProfileRow = RowDataPacket & {
  id: number;
  tenant_id: number;
  email: string;
  first_name: string;
  last_name: string;
  plan: "free" | "pro" | "enterprise";
  is_active: number;
  created_at: Date;
  roles: string;
};

export async function getMyProfile(userId: number): Promise<UserProfileRow | null> {
  const rows = await queryRows<UserProfileRow>(
    `SELECT
      u.id,
      u.tenant_id,
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
     WHERE u.id = ?
       AND u.deleted_at IS NULL
     GROUP BY u.id
     LIMIT 1`,
    [userId]
  );

  return rows[0] ?? null;
}

export async function updateMyProfile(params: {
  userId: number;
  tenantId: number;
  firstName: string;
  lastName: string;
  plan: "free" | "pro" | "enterprise";
}): Promise<void> {
  await query<ResultSetHeader>(
    `UPDATE users
     SET first_name = ?,
         last_name = ?,
         plan = ?
     WHERE id = ?
       AND tenant_id = ?
       AND deleted_at IS NULL`,
    [params.firstName, params.lastName, params.plan, params.userId, params.tenantId]
  );
}

export async function softDeleteMyProfile(params: {
  userId: number;
  tenantId: number;
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
