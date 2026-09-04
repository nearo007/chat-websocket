import { paginationFields, quantitySchema } from "@src/shared/validation/fields.js";
import { z } from "zod";

const nameSchema = z
    .string({ error: "O nome do item é obrigatório." })
    .trim()
    .min(2, "O nome do item deve conter pelo menos 2 caracteres.")
    .max(50, "O nome do item deve ter no máximo 50 caracteres.");

const categorySchema = z
    .string()
    .trim()
    .max(30, "A categoria deve ter no máximo 30 caracteres.")
    .transform((category) => category || null);

const locationSchema = z
    .string({ error: "A localização é obrigatória." })
    .trim()
    .min(1, "A localização é obrigatória.")
    .max(80, "A localização deve ter no máximo 80 caracteres.");

export const createItemSchema = z
    .object({
        name: nameSchema,
        category: categorySchema.optional(),
        totalQuantity: quantitySchema,
        location: locationSchema,
    })
    .strict();

export const updateItemSchema = z
    .object({
        name: nameSchema.optional(),
        category: categorySchema.nullable().optional(),
        totalQuantity: quantitySchema.optional(),
        location: locationSchema.optional(),
        adjustmentReason: z.string().trim().min(3).max(200).optional(),
    })
    .strict()
    .superRefine((data, context) => {
        if (Object.keys(data).length === 0) {
            context.addIssue({
                code: "custom",
                message: "Informe ao menos um campo para atualização.",
            });
        }
        if (data.totalQuantity !== undefined && !data.adjustmentReason) {
            context.addIssue({
                code: "custom",
                path: ["adjustmentReason"],
                message: "Informe o motivo da alteração de quantidade.",
            });
        }
        if (data.totalQuantity === undefined && data.adjustmentReason !== undefined) {
            context.addIssue({
                code: "custom",
                path: ["adjustmentReason"],
                message: "O motivo só pode ser usado com totalQuantity.",
            });
        }
    });

export const itemListQuerySchema = z
    .object({
        ...paginationFields,
        search: z.string().trim().max(100).optional(),
    })
    .strict();

export const categoryQuerySchema = z
    .object({
        ...paginationFields,
        category: z.string().trim().min(1, "A categoria é obrigatória.").max(30),
    })
    .strict();

export const locationQuerySchema = z
    .object({
        ...paginationFields,
        location: z.string().trim().min(1, "A localização é obrigatória.").max(80),
    })
    .strict();
