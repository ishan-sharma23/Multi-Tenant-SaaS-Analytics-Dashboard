import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import {
  getRoleId,
  listTenantUsers,
  softDeleteTenantUser,
  updateUserRole,
} from "../models/admin.model";
import { sendSuccess } from "../utils/response";

const updateRoleSchema = z.object({
  role: z.enum(["admin", "user"]),
});

const userIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export async function getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tenantId = req.authUser?.tenantId;

    if (!tenantId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const users = await listTenantUsers(tenantId);

    sendSuccess(
      res,
      200,
      users.map((user) => ({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        plan: user.plan,
        isActive: Boolean(user.is_active),
        roles: user.roles.split(","),
        createdAt: user.created_at,
      })),
      "Admin users fetched successfully"
    );
  } catch (error) {
    next(error);
  }
}

export async function updateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tenantId = req.authUser?.tenantId;
    const actorUserId = req.authUser?.userId;

    if (!tenantId || !actorUserId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const params = userIdParamSchema.parse(req.params);
    const payload = updateRoleSchema.parse(req.body);

    const roleId = await getRoleId(payload.role);

    await updateUserRole({
      tenantId,
      userId: params.id,
      roleId,
      assignedBy: actorUserId,
    });

    sendSuccess(res, 200, null, "User role updated successfully");
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tenantId = req.authUser?.tenantId;

    if (!tenantId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const params = userIdParamSchema.parse(req.params);

    await softDeleteTenantUser({
      tenantId,
      userId: params.id,
    });

    sendSuccess(res, 200, null, "User deleted successfully");
  } catch (error) {
    next(error);
  }
}
