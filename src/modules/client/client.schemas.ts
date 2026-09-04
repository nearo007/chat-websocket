import { emailSchema, paginationFields, phoneSchema } from "@src/shared/validation/fields.js";
import { z } from "zod";

const nameSchema = z
    .string({ error: "O nome do cliente é obrigatório." })
    .trim()
    .min(2, "O nome do cliente deve conter pelo menos 2 caracteres.")
    .max(50, "O nome do cliente deve ter no máximo 50 caracteres.");

export const createClientSchema = z
    .object({
        name: nameSchema,
        email: emailSchema,
        phone: phoneSchema.optional(),
    })
    .strict();

export const updateClientSchema = z
    .object({
        name: nameSchema.optional(),
        email: emailSchema.optional(),
        phone: phoneSchema.optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, "Informe ao menos um campo para atualização.");

export const clientListQuerySchema = z
    .object({
        ...paginationFields,
        search: z.string().trim().max(100).optional(),
    })
    .strict();
