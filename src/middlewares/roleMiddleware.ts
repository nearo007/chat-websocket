import type { UserRole } from "@src/shared/auth/roles.js";
import { AppError } from "@src/shared/errors/app.error.js";
import type { NextFunction, Request, Response } from "express";

export function requireRole(...roles: UserRole[]) {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.userRole || !roles.includes(req.userRole)) {
            return next(new AppError("Acesso negado.", 403, "FORBIDDEN"));
        }

        next();
    };
}
