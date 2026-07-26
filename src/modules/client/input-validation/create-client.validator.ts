import { MESSAGES } from "@src/constants/messages.js";
import { EmailValidator } from "@src/shared/utils/validators/email.validator.js";
import { PhoneValidator } from "@src/shared/utils/validators/phone.validator.js";
import type { CreateClientDTO } from "../client.dtos.js";
import { AppError } from "@src/shared/errors/app.error.js";

export class CreateClientValidator {
    static validate(data: CreateClientDTO) {
        const minNameLength = 2;
        const maxNameLength = 50;
        const name = data.name?.trim();

        if (!name) throw new AppError(MESSAGES.CLIENT.VALIDATION.NAME_REQUIRED);
        if (name.length < minNameLength) throw new AppError(MESSAGES.CLIENT.VALIDATION.NAME_TOO_SHORT(minNameLength));
        if (name.length > maxNameLength) throw new AppError(MESSAGES.CLIENT.VALIDATION.NAME_TOO_LONG(maxNameLength));

        EmailValidator.validate(data.email);
        PhoneValidator.validate(data.phone);
    }
}
