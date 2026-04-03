import { Router } from "express";
import * as adminController from "../controllers/admin.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

const adminRouter = Router();

adminRouter.use(requireAuth, requireRole(["admin"]));

adminRouter.get("/users", adminController.getUsers);
adminRouter.put("/users/:id/role", adminController.updateRole);
adminRouter.delete("/users/:id", adminController.deleteUser);

export default adminRouter;
