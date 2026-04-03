import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import * as userController from "../controllers/user.controller";

const userRouter = Router();

userRouter.get("/me", requireAuth, userController.getMe);
userRouter.put("/me", requireAuth, userController.updateMe);
userRouter.delete("/me", requireAuth, userController.deleteMe);

export default userRouter;
