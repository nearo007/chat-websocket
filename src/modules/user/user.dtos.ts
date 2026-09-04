import type { UserRole } from "@src/shared/auth/roles.js";

export type UserDTO = {
    username: string;
    email: string;
    id: number;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
};

export type CreateUserDTO = {
    username: string;
    email: string;
    password: string;
    passwordConfirm: string;
    role?: UserRole;
};

export type UpdateUserDTO = {
    username?: string;
    email?: string;
    role?: UserRole;
};

export type UpdateUserPasswordDTO = {
    currentPassword: string;
    newPassword: string;
    passwordConfirm: string;
};
