import { env } from "@src/config/env.js";
import pino from "pino";

export const logger = pino({
    level: env.logLevel,
    redact: {
        paths: [
            "req.headers.authorization",
            "password",
            "passwordConfirm",
            "currentPassword",
            "newPassword",
            "refreshToken",
        ],
        censor: "[REDACTED]",
    },
});
