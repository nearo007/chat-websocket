import { MESSAGES } from "@src/constants/messages.js";
import { EmailValidator } from "@src/shared/utils/validators/email.validator.js";
import { PhoneValidator } from "@src/shared/utils/validators/phone.validator.js";
import type { UpdateClientDTO } from "../client.dtos.js";
import { AppError } from "@src/shared/errors/app.error.js";

export class UpdateClientValidator {
    static validate(data: UpdateClientDTO) {
        if (data.name !== undefined) {
            const name = data.name.trim();
            if (!name) throw new AppError(MESSAGES.CLIENT.VALIDATION.NAME_REQUIRED);
            if (name.length < 2) {
                throw new AppError(MESSAGES.CLIENT.VALIDATION.NAME_TOO_SHORT(2));
            }
            if (name.length > 50) {
                throw new AppError(MESSAGES.CLIENT.VALIDATION.NAME_TOO_LONG(50));
            }
        }

        if (data.email !== undefined) EmailValidator.validate(data.email);
        if (data.phone !== undefined) PhoneValidator.validate(data.phone);
    }
}
