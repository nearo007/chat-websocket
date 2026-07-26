import { MESSAGES } from "@src/constants/messages.js";
import { TokenService } from "@src/shared/services/token.service.js";
import { PrismaAuthRepository } from "@src/modules/auth/repositories/auth.repository.js";
import type { Request, Response, NextFunction } from "express";

const authRepository = new PrismaAuthRepository();

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: MESSAGES.USER.AUTH.TOKEN.NOT_FOUND });
    }

    let payload;
    try {
        payload = TokenService.verify(token);
    } catch {
        return res.status(401).json({ error: MESSAGES.USER.AUTH.TOKEN.INVALID_OR_EXPIRED });
    }

    const userId = typeof payload.sub === "string" ? Number(payload.sub) : NaN;
    if (!Number.isInteger(userId) || userId < 1) {
        return res.status(401).json({ error: MESSAGES.USER.AUTH.TOKEN.INVALID_OR_EXPIRED });
    }

    const user = await authRepository.findUserById(userId);
    if (!user) {
        return res.status(401).json({ error: MESSAGES.USER.AUTH.TOKEN.INVALID_OR_EXPIRED });
    }

    req.userId = String(user.id);
    req.userRole = user.role;
    next();
}
