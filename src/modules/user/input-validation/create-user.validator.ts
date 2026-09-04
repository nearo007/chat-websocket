import type { CreateUserDTO } from "@modules/user/user.dtos.js";
import { EmailValidator } from "@shared/utils/validators/email.validator.js";
import { PasswordValidator } from "@shared/utils/validators/password.validator.js";
import { UsernameValidator } from "@shared/utils/validators/username.validator.js";

export class CreateUserValidator {
    static validate(data: CreateUserDTO) {
        EmailValidator.validate(data.email);
        UsernameValidator.validate(data.username);
        PasswordValidator.validateWithConfirmation(data.password, data.passwordConfirm);
    }
}
