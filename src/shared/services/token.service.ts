import { randomUUID } from "node:crypto";
import { env } from "@src/config/env.js";
import type { JwtPayload, SignOptions, VerifyOptions } from "jsonwebtoken";
import jwt from "jsonwebtoken";

type TokenPayload = JwtPayload & { sub: string; tokenType: "access" | "refresh" };

const commonVerifyOptions: VerifyOptions = {
    algorithms: ["HS256"],
    issuer: env.jwtIssuer,
    audience: env.jwtAudience,
};

export class TokenService {
    static generate(data: { userId: string }) {
        const accessExpiresIn = env.jwtExpiresIn as NonNullable<SignOptions["expiresIn"]>;
        const refreshExpiresIn = env.jwtRefreshExpiresIn as NonNullable<SignOptions["expiresIn"]>;
        const accessToken = jwt.sign({ tokenType: "access" }, env.jwtSecret, {
            subject: data.userId,
            expiresIn: accessExpiresIn,
            issuer: env.jwtIssuer,
            audience: env.jwtAudience,
            algorithm: "HS256",
            jwtid: randomUUID(),
        });

        const refreshToken = jwt.sign({ tokenType: "refresh" }, env.jwtRefreshSecret, {
            subject: data.userId,
            expiresIn: refreshExpiresIn,
            issuer: env.jwtIssuer,
            audience: env.jwtAudience,
            algorithm: "HS256",
            jwtid: randomUUID(),
        });

        return {
            accessToken,
            refreshToken,
            refreshExpiresAt: new Date(Date.now() + env.jwtRefreshExpiresInMs),
        };
    }

    static verifyAccess(token: string): TokenPayload {
        return TokenService.verify(token, env.jwtSecret, "access");
    }

    static verifyRefresh(token: string): TokenPayload {
        return TokenService.verify(token, env.jwtRefreshSecret, "refresh");
    }

    private static verify(
        token: string,
        secret: string,
        expectedType: TokenPayload["tokenType"],
    ): TokenPayload {
        const payload = jwt.verify(token, secret, commonVerifyOptions);
        if (
            typeof payload === "string" ||
            !("sub" in payload) ||
            !("tokenType" in payload) ||
            typeof payload.sub !== "string" ||
            payload.tokenType !== expectedType
        ) {
            throw new Error("Invalid token payload");
        }
        return payload as unknown as TokenPayload;
    }
}
