import { z } from "zod";

export const idSchema = z
    .number()
    .int("O ID deve ser um número inteiro.")
    .positive("O ID deve ser positivo.");

export const emailSchema = z
    .string({ error: "O e-mail é obrigatório." })
    .trim()
    .min(1, "O e-mail é obrigatório.")
    .max(254, "O e-mail é muito longo.")
    .email("O e-mail é inválido.")
    .transform((email) => email.toLowerCase());

export const usernameSchema = z
    .string({ error: "O usuário é obrigatório." })
    .trim()
    .min(3, "O usuário deve conter pelo menos 3 caracteres.")
    .max(24, "O usuário deve ter no máximo 24 caracteres.")
    .regex(/^[a-zA-Z0-9._-]+$/, "O usuário é inválido.");

function atMost72Bytes(value: string) {
    return Buffer.byteLength(value, "utf8") <= 72;
}

export const passwordSchema = z
    .string({ error: "A senha é obrigatória." })
    .min(12, "A senha deve conter pelo menos 12 caracteres.")
    .refine(atMost72Bytes, "A senha deve possuir no máximo 72 bytes.");

export const loginPasswordSchema = z
    .string({ error: "A senha é obrigatória." })
    .min(1, "A senha é obrigatória.")
    .refine(atMost72Bytes, "A senha deve possuir no máximo 72 bytes.");

export const quantitySchema = z
    .number({ error: "A quantidade deve ser um número." })
    .int("A quantidade deve ser um número inteiro.")
    .nonnegative("A quantidade não pode ser negativa.");

export const positiveQuantitySchema = quantitySchema.min(1, "A quantidade mínima é 1.");

const isoDatePattern =
    /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2}))?$/;

export const isoDateSchema = z
    .string({ error: "A data é obrigatória." })
    .trim()
    .regex(isoDatePattern, "A data deve estar no formato ISO 8601 com fuso horário.")
    .refine((value) => {
        const [year, month, day] = value.slice(0, 10).split("-").map(Number);
        const calendarDate = new Date(Date.UTC(year ?? 0, (month ?? 0) - 1, day));
        const calendarIsValid =
            calendarDate.getUTCFullYear() === year &&
            calendarDate.getUTCMonth() === (month ?? 0) - 1 &&
            calendarDate.getUTCDate() === day;
        return calendarIsValid && !Number.isNaN(new Date(value).getTime());
    }, "A data é inválida.");

export const phoneSchema = z
    .union([z.string(), z.null()])
    .transform((value) => {
        if (value === null || value.trim() === "") return null;
        return value.replace(/\D/g, "");
    })
    .refine(
        (value) => value === null || (value.length >= 8 && value.length <= 15),
        "O telefone deve conter entre 8 e 15 dígitos.",
    );

export const paginationFields = {
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(50),
};

export const paginationQuerySchema = z.object(paginationFields).strict();

export type Pagination = { skip: number; take: number };

export function paginationFrom(value: { page: number; pageSize: number }): Pagination {
    return { skip: (value.page - 1) * value.pageSize, take: value.pageSize };
}
