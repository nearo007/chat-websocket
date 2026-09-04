import { errorHandler } from "@middlewares/errorHandler.js";
import { authRouter } from "@modules/auth/auth.routes.js";
import { clientRouter } from "@modules/client/client.routes.js";
import { healthRouter } from "@modules/health/health.routes.js";
import { itemRouter } from "@modules/item/item.routes.js";
import { loanRouter } from "@modules/loan/loan.routes.js";
import { userRouter } from "@modules/user/user.routes.js";
import { env } from "@src/config/env.js";
import { apiRateLimiter } from "@src/middlewares/rateLimitMiddleware.js";
import { AppError } from "@src/shared/errors/app.error.js";
import { logger } from "@src/shared/logger.js";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";

const app = express();

app.disable("x-powered-by");
app.use(pinoHttp({ logger }));
app.use(helmet());
app.use(cors({ origin: env.corsOrigins }));
app.use(express.json({ limit: env.jsonBodyLimit }));
app.use("/health", healthRouter);
app.use(apiRateLimiter);
app.use("/user", userRouter);
app.use("/item", itemRouter);
app.use("/loan", loanRouter);
app.use("/auth", authRouter);
app.use("/client", clientRouter);

app.use((_req, _res, next) => {
    next(new AppError("Rota não encontrada.", 404, "ROUTE_NOT_FOUND"));
});
app.use(errorHandler);

export { app };
