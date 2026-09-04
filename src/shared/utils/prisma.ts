import { MESSAGES } from "@src/constants/messages.js";
import { Prisma } from "@src/generated/prisma/client.js";
import { AppError } from "@src/shared/errors/app.error.js";

export const handlePrismaError = (err: unknown): never => {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case "P2002": {
                const meta = err.meta as {
                    driverAdapterError?: {
                        cause?: {
                            constraint?: {
                                fields?: string[];
                            };
                        };
                    };
                    target?: string[];
                };

                const fields = meta.target || meta.driverAdapterError?.cause?.constraint?.fields;
                const field = fields?.[0];

                if (field === "email" && err.meta?.modelName === "Client") {
                    throw new AppError(MESSAGES.CLIENT.CONFLICT.EMAIL_EXISTS, 409);
                }

                if (field === "email") {
                    throw new AppError(MESSAGES.USER.CONFLICT.EMAIL_EXISTS, 409);
                }

                throw new AppError("Conflito de restrição única.", 409);
            }
            case "P2025": {
                const modelName = err.meta?.modelName;
                const message =
                    modelName === "Item"
                        ? MESSAGES.ITEM.NOT_FOUND.BY_ID
                        : modelName === "Client"
                          ? MESSAGES.CLIENT.NOT_FOUND.BY_ID
                          : modelName === "Loan"
                            ? MESSAGES.LOAN.NOT_FOUND.BY_ID
                            : MESSAGES.USER.NOT_FOUND.BY_ID;
                throw new AppError(message, 404);
            }
            case "P2020":
                throw new AppError(
                    MESSAGES.SHARED.VALIDATION.QUANTITY_INVALID,
                    400,
                    "VALIDATION_ERROR",
                );
            case "P2003":
                throw new AppError(
                    "O registro não pode ser alterado ou removido porque possui dados relacionados.",
                    409,
                    "RELATED_RECORD_CONFLICT",
                );
            default:
                throw new AppError("Erro interno de banco de dados.", 500, "DATABASE_ERROR");
        }
    }

    if (err instanceof Prisma.PrismaClientValidationError) {
        throw new AppError("Dados inválidos para a operação.", 400, "VALIDATION_ERROR");
    }

    throw err;
};
