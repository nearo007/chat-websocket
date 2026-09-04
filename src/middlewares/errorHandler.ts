import { AppError } from "@src/shared/errors/app.error.js";
import { logger } from "@src/shared/logger.js";
import { handlePrismaError } from "@src/shared/utils/prisma.js";
import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

function sendError(res: Response, error: AppError) {
    return res.status(error.statusCode).json({
        error: { code: error.code, message: error.message },
    });
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
    if (err instanceof AppError) {
        if (err.statusCode >= 500) {
            logger.error({ err, method: req.method, path: req.originalUrl }, "Request failed");
        }
        return sendError(res, err);
    }

    if (err instanceof ZodError) {
        const message = err.issues[0]?.message ?? "Dados inválidos.";
        return sendError(res, new AppError(message, 400, "VALIDATION_ERROR"));
    }

    if (err instanceof SyntaxError && "type" in err && err.type === "entity.parse.failed") {
        return sendError(res, new AppError("JSON inválido.", 400, "INVALID_JSON"));
    }

    let error: unknown = err;

    try {
        handlePrismaError(err);
    } catch (e) {
        error = e;
    }

    if (error instanceof AppError) {
        if (error.statusCode >= 500) {
            logger.error(
                { err, method: req.method, path: req.originalUrl },
                "Database request failed",
            );
        }
        return sendError(res, error);
    }

    logger.error(
        { err: error, method: req.method, path: req.originalUrl },
        "Unhandled request error",
    );
    return sendError(res, new AppError("Erro interno.", 500, "INTERNAL_ERROR"));
}
