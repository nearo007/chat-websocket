import {
    idSchema,
    isoDateSchema,
    paginationFields,
    positiveQuantitySchema,
} from "@src/shared/validation/fields.js";
import { z } from "zod";

export const createLoanSchema = z
    .object({
        clientId: idSchema,
        itemId: idSchema,
        loanDate: isoDateSchema,
        dueDate: isoDateSchema,
        loanQuantity: positiveQuantitySchema,
        returnDate: isoDateSchema.nullable().optional(),
    })
    .strict();

export const updateLoanSchema = z
    .object({
        loanDate: isoDateSchema.optional(),
        dueDate: isoDateSchema.optional(),
        returnDate: isoDateSchema.nullable().optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, "Informe ao menos um campo para atualização.");

export const loanListQuerySchema = z
    .object({
        ...paginationFields,
        status: z.enum(["all", "active", "returned", "cancelled", "overdue"]).default("all"),
    })
    .strict();
