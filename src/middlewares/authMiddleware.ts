import { MESSAGES } from "@src/constants/messages.js";
import { PrismaAuthRepository } from "@src/modules/auth/repositories/auth.repository.js";
import { AppError } from "@src/shared/errors/app.error.js";
import { TokenService } from "@src/shared/services/token.service.js";
import type { NextFunction, Request, Response } from "express";

const authRepository = new PrismaAuthRepository();

export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
    const authorization = req.headers.authorization;
    const [scheme, token] = authorization?.split(" ") ?? [];

    if (!authorization) {
        return next(new AppError(MESSAGES.USER.AUTH.TOKEN.NOT_FOUND, 401, "TOKEN_MISSING"));
    }

    if (scheme !== "Bearer" || !token) {
        return next(
            new AppError(MESSAGES.USER.AUTH.TOKEN.INVALID_OR_EXPIRED, 401, "TOKEN_INVALID"),
        );
    }

    let payload: ReturnType<typeof TokenService.verifyAccess>;
    try {
        payload = TokenService.verifyAccess(token);
    } catch {
        return next(
            new AppError(MESSAGES.USER.AUTH.TOKEN.INVALID_OR_EXPIRED, 401, "TOKEN_INVALID"),
        );
    }

    const userId = typeof payload.sub === "string" ? Number(payload.sub) : NaN;
    if (!Number.isInteger(userId) || userId < 1) {
        return next(
            new AppError(MESSAGES.USER.AUTH.TOKEN.INVALID_OR_EXPIRED, 401, "TOKEN_INVALID"),
        );
    }

    const user = await authRepository.findUserById(userId);
    if (!user) {
        return next(
            new AppError(MESSAGES.USER.AUTH.TOKEN.INVALID_OR_EXPIRED, 401, "TOKEN_INVALID"),
        );
    }

    req.userId = String(user.id);
    req.userRole = user.role;
    next();
}
