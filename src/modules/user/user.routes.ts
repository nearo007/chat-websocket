import { userController } from "@modules/user/user.controller.js";
import { authMiddleware } from "@src/middlewares/authMiddleware.js";
import { requireRole } from "@src/middlewares/roleMiddleware.js";
import { validateBody } from "@src/middlewares/validateMiddleware.js";
import { Router } from "express";
import { changePasswordSchema, createUserSchema, updateUserSchema } from "./user.schemas.js";

const userRouter = Router();

userRouter.post(
    "/",
    authMiddleware,
    requireRole("ADMIN"),
    validateBody(createUserSchema),
    userController.create,
);
userRouter.get("/", authMiddleware, requireRole("ADMIN"), userController.list);
userRouter.patch(
    "/me/password",
    authMiddleware,
    validateBody(changePasswordSchema),
    userController.updateOwnPassword,
);
userRouter.get("/:id", authMiddleware, requireRole("ADMIN"), userController.getById);
userRouter.patch(
    "/:id",
    authMiddleware,
    requireRole("ADMIN"),
    validateBody(updateUserSchema),
    userController.updateById,
);
userRouter.delete("/:id", authMiddleware, requireRole("ADMIN"), userController.deleteById);

export { userRouter };
