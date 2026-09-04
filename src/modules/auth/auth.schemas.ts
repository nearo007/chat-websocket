import { emailSchema, loginPasswordSchema } from "@src/shared/validation/fields.js";
import { z } from "zod";

export const loginSchema = z
    .object({
        email: emailSchema,
        password: loginPasswordSchema,
    })
    .strict();

export const refreshTokenSchema = z
    .object({
        refreshToken: z.string().min(1, "O refresh token é obrigatório."),
    })
    .strict();
