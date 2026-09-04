import type {
    CreateUserDTO,
    UpdateUserDTO,
    UpdateUserPasswordDTO,
    UserDTO,
} from "@modules/user/user.dtos.js";
import { Bcrypt } from "@shared/utils/bcrypt.js";
import { MESSAGES } from "@src/constants/messages.js";
import { CreateUserValidator } from "@src/modules/user/input-validation/create-user.validator.js";
import {
    PrismaUserRepository,
    type UserRepository,
} from "@src/modules/user/repositories/user.repository.js";
import { AppError } from "@src/shared/errors/app.error.js";
import { EmailValidator } from "@src/shared/utils/validators/email.validator.js";
import { PasswordValidator } from "@src/shared/utils/validators/password.validator.js";
import { UsernameValidator } from "@src/shared/utils/validators/username.validator.js";

export class UserService {
    constructor(private readonly userRepository: UserRepository = new PrismaUserRepository()) {}

    async create(data: CreateUserDTO): Promise<UserDTO> {
        const { username, email, password } = data;

        CreateUserValidator.validate(data);

        const passwordHash = await Bcrypt.hashPassword(password);

        const hashedData = {
            username,
            email,
            passwordHash,
            ...(data.role !== undefined ? { role: data.role } : {}),
        };

        const user = await this.userRepository.create(hashedData);

        return user;
    }

    async list(options: { skip: number; take: number; search?: string }): Promise<UserDTO[]> {
        return this.userRepository.list(options);
    }

    async getById(id: number): Promise<UserDTO> {
        const user = await this.userRepository.findById(id);
        if (!user) throw new AppError(MESSAGES.USER.NOT_FOUND.BY_ID, 404, "USER_NOT_FOUND");
        return user;
    }

    async updateById(id: number, data: UpdateUserDTO): Promise<UserDTO> {
        if (data.email !== undefined) EmailValidator.validate(data.email);
        if (data.username !== undefined) UsernameValidator.validate(data.username);
        const result = await this.userRepository.updatePreservingLastAdmin(id, {
            ...(data.email !== undefined ? { email: data.email } : {}),
            ...(data.username !== undefined ? { username: data.username } : {}),
            ...(data.role !== undefined ? { role: data.role } : {}),
        });
        if (result.status === "not_found") {
            throw new AppError(MESSAGES.USER.NOT_FOUND.BY_ID, 404, "USER_NOT_FOUND");
        }
        if (result.status === "last_admin") {
            throw new AppError("O último administrador não pode ser rebaixado.", 409, "LAST_ADMIN");
        }
        return result.user;
    }

    async updateOwnPassword(id: number, data: UpdateUserPasswordDTO): Promise<void> {
        PasswordValidator.validate(data.newPassword);
        if (data.newPassword !== data.passwordConfirm) {
            throw new AppError(
                MESSAGES.USER.CONFLICT.PASSWORDS_DO_NOT_MATCH,
                400,
                "PASSWORD_MISMATCH",
            );
        }
        const user = await this.userRepository.findCredentialsById(id);
        if (!user) throw new AppError(MESSAGES.USER.NOT_FOUND.BY_ID, 404, "USER_NOT_FOUND");

        const correctPassword = await Bcrypt.comparePassword(
            data.currentPassword,
            user.passwordHash,
        );
        if (!correctPassword) {
            throw new AppError(
                MESSAGES.USER.AUTH.INCORRECT_CREDENTIALS,
                401,
                "INCORRECT_CREDENTIALS",
            );
        }

        const passwordHash = await Bcrypt.hashPassword(data.newPassword);
        await this.userRepository.updatePasswordAndRevokeTokens(id, passwordHash);
    }

    async deleteById(id: number): Promise<void> {
        const result = await this.userRepository.deletePreservingLastAdmin(id);
        if (result === "not_found") {
            throw new AppError(MESSAGES.USER.NOT_FOUND.BY_ID, 404, "USER_NOT_FOUND");
        }
        if (result === "last_admin") {
            throw new AppError("O último administrador não pode ser removido.", 409, "LAST_ADMIN");
        }
    }
}

const userService = new UserService();

export { userService };
