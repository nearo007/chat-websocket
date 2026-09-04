import { MESSAGES } from "@src/constants/messages.js";
import { AppError } from "@src/shared/errors/app.error.js";

export class PhoneValidator {
    static validate(raw: string | undefined | null) {
        if (!raw || raw.trim() === "") return;
        const digits = raw.replace(/\D/g, "");
        if (digits.length < 8 || digits.length > 15) {
            throw new AppError(MESSAGES.SHARED.VALIDATION.PHONE_INVALID);
        }
    }
}
