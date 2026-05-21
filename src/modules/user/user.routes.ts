import { Router } from "express";
import { userController } from "@modules/user/user.controller.js";
import { authMiddleware } from "@src/middlewares/authMiddleware.js";

const userRouter = Router();

userRouter.post("/", userController.create);
userRouter.get("/", authMiddleware, userController.list);
userRouter.get("/:id", authMiddleware, userController.getById);
userRouter.patch("/:id", authMiddleware, userController.updateById);
userRouter.delete("/:id", authMiddleware, userController.deleteById);

export { userRouter };
