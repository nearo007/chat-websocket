import type { Request, Response, NextFunction } from "express";
import type { UserRole } from "@src/shared/auth/roles.js";

export function requireRole(...roles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.userRole || !roles.includes(req.userRole)) {
            return res.status(403).json({ error: "Acesso negado." });
        }

        next();
    };
}
