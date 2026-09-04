import type { LoginDTO } from "@modules/auth/auth.dtos.js";
import { EmailValidator } from "@shared/utils/validators/email.validator.js";
import { PasswordValidator } from "@shared/utils/validators/password.validator.js";

export class LoginValidator {
    static validate(data: LoginDTO) {
        EmailValidator.validate(data.email);
        PasswordValidator.validateForAuthentication(data.password);
    }
}
