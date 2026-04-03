import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { getMyProfile, softDeleteMyProfile, updateMyProfile } from "../models/user.model";
import { sendSuccess } from "../utils/response";

const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  plan: z.enum(["free", "pro", "enterprise"]),
});

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.authUser?.userId;

    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const profile = await getMyProfile(userId);

    if (!profile) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }

    sendSuccess(
      res,
      200,
      {
        id: profile.id,
        tenantId: profile.tenant_id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        plan: profile.plan,
        isActive: Boolean(profile.is_active),
        roles: profile.roles.split(","),
        createdAt: profile.created_at,
      },
      "Profile fetched successfully"
    );
  } catch (error) {
    next(error);
  }
}

export async function updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.authUser?.userId;
    const tenantId = req.authUser?.tenantId;

    if (!userId || !tenantId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const payload = updateProfileSchema.parse(req.body);

    await updateMyProfile({
      userId,
      tenantId,
      firstName: payload.firstName,
      lastName: payload.lastName,
      plan: payload.plan,
    });

    sendSuccess(res, 200, null, "Profile updated successfully");
  } catch (error) {
    next(error);
  }
}

export async function deleteMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.authUser?.userId;
    const tenantId = req.authUser?.tenantId;

    if (!userId || !tenantId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    await softDeleteMyProfile({ userId, tenantId });

    sendSuccess(res, 200, null, "Profile deleted successfully");
  } catch (error) {
    next(error);
  }
}
