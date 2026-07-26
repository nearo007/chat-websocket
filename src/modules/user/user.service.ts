import { MESSAGES } from "@src/constants/messages.js";
import { Bcrypt } from "@shared/utils/bcrypt.js";
import type {
    UserDTO,
    CreateUserDTO,
    UpdateUserDTO,
    UpdateUserPasswordDTO,
} from "@modules/user/user.dtos.js";
import { CreateUserValidator } from "@src/modules/user/input-validation/create-user.validator.js";
import {
    PrismaUserRepository,
    type UserRepository,
} from "@src/modules/user/repositories/user.repository.js";
import { EmailValidator } from "@src/shared/utils/validators/email.validator.js";
import { PasswordValidator } from "@src/shared/utils/validators/password.validator.js";
import { UsernameValidator } from "@src/shared/utils/validators/username.validator.js";

class UserService {
    constructor(
        private readonly userRepository: UserRepository =
            new PrismaUserRepository(),
    ) {}

    async create(data: CreateUserDTO): Promise<UserDTO> {
        const { username, email, password } = data;

        CreateUserValidator.validate(data);

        const passwordHash = await Bcrypt.hashPassword(password);

        const hashedData = { username, email, passwordHash };

        const user = await this.userRepository.create(hashedData);

        return user;
    }

    async list(): Promise<UserDTO[]> {
        return this.userRepository.list();
    }

    async getById(id: number): Promise<UserDTO | null> {
        return this.userRepository.findById(id);
    }

    async updateById(id: number, data: UpdateUserDTO): Promise<UserDTO> {
        if (data.email !== undefined) EmailValidator.validate(data.email);
        if (data.username !== undefined) UsernameValidator.validate(data.username);
        return this.userRepository.update(id, data);
    }

    async updatePasswordById(
        id: number,
        data: UpdateUserPasswordDTO,
    ): Promise<void> {
        PasswordValidator.validate(data.password);
        const passwordHash = await Bcrypt.hashPassword(data.password);
        await this.userRepository.updatePassword(id, passwordHash);
    }

    async deleteById(id: number): Promise<void> {
        await this.userRepository.delete(id);
    }
}

const userService = new UserService();
export { userService };
