import { MESSAGES } from "@src/constants/messages.js";
import { AppError } from "@src/shared/errors/app.error.js";

export class PasswordValidator {
    static validateWithConfirmation(raw: string, passwordConfirm: string) {
        const minLength = 12;

        if (!raw || !passwordConfirm) {
            throw new AppError(MESSAGES.USER.VALIDATION.PASSWORD_REQUIRED);
        }

        if (raw !== passwordConfirm) {
            throw new AppError(MESSAGES.USER.CONFLICT.PASSWORDS_DO_NOT_MATCH);
        }

        if (raw.length < minLength) {
            throw new AppError(MESSAGES.USER.VALIDATION.PASSWORD_TOO_SHORT(minLength));
        } else if (Buffer.byteLength(raw, "utf8") > 72) {
            throw new AppError(MESSAGES.USER.VALIDATION.PASSWORD_TOO_LONG(72));
        }
    }
    static validate(raw: string) {
        const minLength = 12;

        if (!raw) {
            throw new AppError(MESSAGES.USER.VALIDATION.PASSWORD_REQUIRED);
        }

        if (raw.length < minLength) {
            throw new AppError(MESSAGES.USER.VALIDATION.PASSWORD_TOO_SHORT(minLength));
        }

        if (Buffer.byteLength(raw, "utf8") > 72) {
            throw new AppError(MESSAGES.USER.VALIDATION.PASSWORD_TOO_LONG(72));
        }
    }

    static validateForAuthentication(raw: string) {
        if (!raw) {
            throw new AppError(MESSAGES.USER.VALIDATION.PASSWORD_REQUIRED);
        }
        if (Buffer.byteLength(raw, "utf8") > 72) {
            throw new AppError(MESSAGES.USER.VALIDATION.PASSWORD_TOO_LONG(72));
        }
    }
}
