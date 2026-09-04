import type { Response } from "express";
import { rateLimit } from "express-rate-limit";

const common = {
    standardHeaders: "draft-8" as const,
    legacyHeaders: false,
    handler: (_request: unknown, response: Response) =>
        response.status(429).json({
            error: {
                code: "RATE_LIMITED",
                message: "Muitas tentativas. Tente novamente mais tarde.",
            },
        }),
};

export const apiRateLimiter = rateLimit({
    ...common,
    windowMs: 15 * 60 * 1_000,
    limit: 500,
});

export const authRateLimiter = rateLimit({
    ...common,
    windowMs: 15 * 60 * 1_000,
    limit: 20,
});
