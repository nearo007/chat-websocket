import { MESSAGES } from "@src/constants/messages.js";
import { AppError } from "@src/shared/errors/app.error.js";

export class DateValidator {
    static validate(
        dateString: string,
        fieldName: string = MESSAGES.FIELDS.DATE,
    ) {
        if (!dateString) {
            throw new AppError(
                MESSAGES.SHARED.VALIDATION.REQUIRED_FIELD(fieldName),
            );
        }

        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            throw new AppError(
                MESSAGES.SHARED.VALIDATION.INVALID_FIELD(fieldName),
            );
        }
    }
}
