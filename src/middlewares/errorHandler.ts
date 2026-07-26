import { handlePrismaError } from "@src/shared/utils/prisma.js";
import { AppError } from "@src/shared/errors/app.error.js";
import type { Request, Response, NextFunction } from "express";

export function errorHandler(
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction,
) {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ errorMessage: err.message });
    }

    let error: unknown = err;

    try {
        handlePrismaError(err);
    } catch (e) {
        error = e;
    }

    if (error instanceof AppError) {
        return res.status(error.statusCode).json({ errorMessage: error.message });
    }

    console.error(error);
    return res.status(500).json({ errorMessage: "Erro interno" });
}
