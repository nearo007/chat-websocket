import type { AuthToken, Prisma, User } from "@src/generated/prisma/client.js";
import { prisma } from "@src/lib/prisma.js";
import type { UserRole } from "@src/shared/auth/roles.js";

export type AuthUser = Pick<User, "id" | "email" | "passwordHash"> & {
    role: UserRole;
};

export type RefreshTokenData = Pick<AuthToken, "userId" | "refreshTokenHash" | "expiresAt">;

export interface AuthRepository {
    findUserByEmail(email: string): Promise<AuthUser | null>;
    findUserById(id: number): Promise<Pick<User, "id" | "role"> | null>;
    createRefreshToken(data: RefreshTokenData): Promise<void>;
    findValidRefreshToken(refreshTokenHash: string, now: Date): Promise<AuthToken | null>;
    rotateRefreshToken(tokenId: number, data: RefreshTokenData, now: Date): Promise<boolean>;
    revokeRefreshToken(refreshTokenHash: string): Promise<void>;
    revokeAllRefreshTokens(userId: number): Promise<void>;
    deleteExpiredRefreshTokens(now: Date): Promise<void>;
}

const authUserSelect = {
    id: true,
    email: true,
    passwordHash: true,
    role: true,
} as const;

export class PrismaAuthRepository implements AuthRepository {
    findUserByEmail(email: string) {
        return prisma.user.findFirst({
            where: { email: { equals: email, mode: "insensitive" } },
            select: authUserSelect,
        });
    }

    findUserById(id: number) {
        return prisma.user.findUnique({
            where: { id },
            select: { id: true, role: true },
        });
    }

    async createRefreshToken(data: RefreshTokenData): Promise<void> {
        await prisma.authToken.create({ data, select: { id: true } });
    }

    findValidRefreshToken(refreshTokenHash: string, now: Date) {
        return prisma.authToken.findFirst({
            where: {
                refreshTokenHash,
                revoked: false,
                expiresAt: { gt: now },
            },
        });
    }

    async rotateRefreshToken(tokenId: number, data: RefreshTokenData, now: Date): Promise<boolean> {
        return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const revoked = await tx.authToken.updateMany({
                where: {
                    id: tokenId,
                    revoked: false,
                    expiresAt: { gt: now },
                },
                data: { revoked: true },
            });

            if (revoked.count !== 1) {
                return false;
            }

            await tx.authToken.create({ data, select: { id: true } });
            return true;
        });
    }

    async revokeRefreshToken(refreshTokenHash: string): Promise<void> {
        await prisma.authToken.updateMany({
            where: { refreshTokenHash, revoked: false },
            data: { revoked: true },
        });
    }

    async revokeAllRefreshTokens(userId: number): Promise<void> {
        await prisma.authToken.updateMany({
            where: { userId, revoked: false },
            data: { revoked: true },
        });
    }

    async deleteExpiredRefreshTokens(now: Date): Promise<void> {
        await prisma.authToken.deleteMany({
            where: { OR: [{ expiresAt: { lte: now } }, { revoked: true }] },
        });
    }
}
