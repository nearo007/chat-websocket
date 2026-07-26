import type { UserRole } from "@src/shared/auth/roles.js";

export type UserDTO = {
    username: string;
    email: string;
    id: number;
    role: UserRole;
};

export type CreateUserDTO = {
    username: string;
    email: string;
    password: string;
    passwordConfirm: string;
};

export type UpdateUserDTO = {
    username?: string;
    email?: string;
};

export type UpdateUserPasswordDTO = {
    password: string;
};
