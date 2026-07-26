import { Router } from "express";
import { userController } from "@modules/user/user.controller.js";
import { authMiddleware } from "@src/middlewares/authMiddleware.js";
import { requireRole } from "@src/middlewares/roleMiddleware.js";

const userRouter = Router();

userRouter.post("/", userController.create);
userRouter.get("/", authMiddleware, requireRole("ADMIN"), userController.list);
userRouter.get("/:id", authMiddleware, requireRole("ADMIN"), userController.getById);
userRouter.patch("/:id", authMiddleware, requireRole("ADMIN"), userController.updateById);
userRouter.delete("/:id", authMiddleware, requireRole("ADMIN"), userController.deleteById);

export { userRouter };
