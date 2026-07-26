import { MESSAGES } from "@src/constants/messages.js";
import { AppError } from "@src/shared/errors/app.error.js";

export class PasswordValidator {
    static validateWithConfirmation(raw: string, passwordConfirm: string) {
        const minLength = 6;
        const maxLength = 18;
        const hasOneLetterOrNumber = /[A-Za-z0-9]/;

        if (!raw || !passwordConfirm) {
            throw new AppError(MESSAGES.USER.VALIDATION.PASSWORD_REQUIRED);
        }

        if (raw !== passwordConfirm) {
            throw new AppError(MESSAGES.USER.CONFLICT.PASSWORDS_DO_NOT_MATCH)
        }

        const value = raw.trim();

        if (value === "") {
            throw new AppError(MESSAGES.USER.VALIDATION.PASSWORD_INVALID);
        }

        if (!hasOneLetterOrNumber.test(value)) {
            throw new AppError(MESSAGES.USER.VALIDATION.PASSWORD_INVALID);
        }

        if (value.length < minLength) {
            throw new AppError(
                MESSAGES.USER.VALIDATION.PASSWORD_TOO_SHORT(minLength),
            );
        }

        else if (value.length > maxLength) {
            throw new AppError(
                MESSAGES.USER.VALIDATION.PASSWORD_TOO_LONG(maxLength),
            )
        }
    }
    static validate(raw: string) {
        const maxLength = 18;

        if (!raw) {
            throw new AppError(MESSAGES.USER.VALIDATION.PASSWORD_REQUIRED);
        }

        else if (raw.length > maxLength) {
            throw new AppError(
                MESSAGES.USER.VALIDATION.PASSWORD_TOO_LONG(maxLength),
            )
        }
    }
}
