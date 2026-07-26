import type { UserRole } from "@src/shared/auth/roles.js";

declare global {
    namespace Express {
        interface Request {
            userId: string | undefined;
            userRole: UserRole | undefined;
        }
    }
}

export {};
