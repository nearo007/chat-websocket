import { authMiddleware } from "@src/middlewares/authMiddleware.js";
import { authRateLimiter } from "@src/middlewares/rateLimitMiddleware.js";
import { validateBody } from "@src/middlewares/validateMiddleware.js";
import { Router } from "express";
import { authController } from "./auth.controller.js";
import { loginSchema, refreshTokenSchema } from "./auth.schemas.js";

const authRouter = Router();

authRouter.post("/login", authRateLimiter, validateBody(loginSchema), authController.login);
authRouter.post(
    "/refresh",
    authRateLimiter,
    validateBody(refreshTokenSchema),
    authController.refresh,
);
authRouter.post("/logout", validateBody(refreshTokenSchema), authController.logout);
authRouter.post("/logout-all", authMiddleware, authController.logoutAll);

export { authRouter };
