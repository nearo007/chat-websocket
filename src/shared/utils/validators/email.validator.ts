import { MESSAGES } from "@src/constants/messages.js";
import { AppError } from "@src/shared/errors/app.error.js";

export class EmailValidator {
    static validate(raw: string) {
        if (!raw || raw.trim() === "") {
            throw new AppError(MESSAGES.USER.VALIDATION.EMAIL_REQUIRED);
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
            throw new AppError(MESSAGES.USER.VALIDATION.EMAIL_INVALID);
        }
    }
}
