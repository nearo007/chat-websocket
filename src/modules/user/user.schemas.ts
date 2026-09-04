import { USER_ROLES } from "@src/shared/auth/roles.js";
import {
    emailSchema,
    loginPasswordSchema,
    paginationFields,
    passwordSchema,
    usernameSchema,
} from "@src/shared/validation/fields.js";
import { z } from "zod";

const roleSchema = z.enum(USER_ROLES);

export const createUserSchema = z
    .object({
        username: usernameSchema,
        email: emailSchema,
        password: passwordSchema,
        passwordConfirm: z.string(),
        role: roleSchema.optional(),
    })
    .strict()
    .refine((data) => data.password === data.passwordConfirm, {
        path: ["passwordConfirm"],
        message: "As senhas não coincidem.",
    });

export const updateUserSchema = z
    .object({
        username: usernameSchema.optional(),
        email: emailSchema.optional(),
        role: roleSchema.optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, "Informe ao menos um campo para atualização.");

export const changePasswordSchema = z
    .object({
        currentPassword: loginPasswordSchema,
        newPassword: passwordSchema,
        passwordConfirm: z.string(),
    })
    .strict()
    .refine((data) => data.newPassword === data.passwordConfirm, {
        path: ["passwordConfirm"],
        message: "As senhas não coincidem.",
    });

export const userListQuerySchema = z
    .object({
        ...paginationFields,
        search: z.string().trim().max(100).optional(),
    })
    .strict();
