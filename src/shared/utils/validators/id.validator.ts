import { MESSAGES } from "@src/constants/messages.js";
import { AppError } from "@src/shared/errors/app.error.js";

export class IdValidator {
    static validate(id: number) {
        if (id === null || id === undefined) {
            throw new AppError(MESSAGES.SHARED.VALIDATION.REQUIRED_FIELD(MESSAGES.FIELDS.ID));
        }

        if (!Number.isInteger(id)) {
            throw new AppError(MESSAGES.SHARED.VALIDATION.INVALID_FIELD(MESSAGES.FIELDS.ID));
        }

        if (id < 1) {
            throw new AppError(MESSAGES.SHARED.VALIDATION.INVALID_FIELD(MESSAGES.FIELDS.ID));
        }
    }
}
