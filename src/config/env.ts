import "dotenv/config";
import ms, { type StringValue } from "ms";
import { z } from "zod";

function duration(maximumMilliseconds: number) {
    return z
        .string()
        .regex(/^\d+(ms|s|m|h|d|w)$/, "deve ser uma duração como 15m ou 7d")
        .refine((value) => {
            const parsed = ms(value as StringValue);
            return typeof parsed === "number" && parsed > 0 && parsed <= maximumMilliseconds;
        }, "está fora do intervalo permitido");
}
const secret = z
    .string()
    .min(32, "deve possuir pelo menos 32 caracteres")
    .refine(
        (value) => !/(replace|change|dev[_-]?secret)/i.test(value),
        "deve ser substituído por um segredo aleatório",
    );
const corsOrigins = z
    .string()
    .default("http://localhost:5173")
    .refine((value) => {
        const origins = value
            .split(",")
            .map((origin) => origin.trim())
            .filter(Boolean);
        return (
            origins.length > 0 &&
            origins.every((origin) => {
                try {
                    const url = new URL(origin);
                    return ["http:", "https:"].includes(url.protocol) && url.origin === origin;
                } catch {
                    return false;
                }
            })
        );
    }, "deve conter uma lista de origens HTTP(S) separadas por vírgula");

const envSchema = z
    .object({
        NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
        PORT: z.coerce.number().int().min(1).max(65_535).default(3_000),
        DATABASE_URL: z.string().regex(/^postgres(?:ql)?:\/\//, "deve ser uma URL PostgreSQL"),
        DB_CONNECTION_TIMEOUT_MS: z.coerce.number().int().min(100).max(60_000).default(5_000),
        JWT_SECRET: secret,
        JWT_SECRET_REFRESH: secret,
        JWT_EXPIRES_IN: duration(ms("24h")).default("15m"),
        JWT_REFRESH_EXPIRES_IN: duration(ms("90d")).default("7d"),
        JWT_ISSUER: z.string().min(1).default("sistema-inventario-fablab"),
        JWT_AUDIENCE: z.string().min(1).default("sistema-inventario-fablab-api"),
        CORS_ORIGINS: corsOrigins,
        JSON_BODY_LIMIT: z
            .string()
            .regex(/^\d+(?:b|kb|mb)$/i, "deve ser um limite como 100kb ou 1mb")
            .default("100kb"),
        LOG_LEVEL: z
            .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
            .default("info"),
    })
    .superRefine((value, context) => {
        if (value.JWT_SECRET === value.JWT_SECRET_REFRESH) {
            context.addIssue({
                code: "custom",
                path: ["JWT_SECRET_REFRESH"],
                message: "deve ser diferente de JWT_SECRET",
            });
        }
    });

const result = envSchema.safeParse(process.env);

if (!result.success) {
    const details = result.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");
    throw new Error(`Configuração de ambiente inválida: ${details}`);
}

const raw = result.data;

function durationInMilliseconds(value: string): number {
    const parsed = ms(value as StringValue);
    if (typeof parsed !== "number" || parsed <= 0) {
        throw new Error(`Duração inválida: ${value}`);
    }
    return parsed;
}

export const env = {
    nodeEnv: raw.NODE_ENV,
    port: raw.PORT,
    databaseUrl: raw.DATABASE_URL,
    databaseConnectionTimeoutMs: raw.DB_CONNECTION_TIMEOUT_MS,
    jwtSecret: raw.JWT_SECRET,
    jwtRefreshSecret: raw.JWT_SECRET_REFRESH,
    jwtExpiresIn: raw.JWT_EXPIRES_IN,
    jwtRefreshExpiresIn: raw.JWT_REFRESH_EXPIRES_IN,
    jwtRefreshExpiresInMs: durationInMilliseconds(raw.JWT_REFRESH_EXPIRES_IN),
    jwtIssuer: raw.JWT_ISSUER,
    jwtAudience: raw.JWT_AUDIENCE,
    corsOrigins: raw.CORS_ORIGINS.split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
    jsonBodyLimit: raw.JSON_BODY_LIMIT,
    logLevel: raw.LOG_LEVEL,
} as const;
