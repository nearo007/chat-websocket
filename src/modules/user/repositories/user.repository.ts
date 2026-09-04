import type { Prisma, User } from "@src/generated/prisma/client.js";
import { prisma } from "@src/lib/prisma.js";
import type { UserRole } from "@src/shared/auth/roles.js";

export type PublicUser = Pick<User, "id" | "email" | "username"> & {
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
};

export type UserCredentials = Pick<User, "id" | "passwordHash">;
export type UserUpdateData = Pick<Prisma.UserUpdateInput, "email" | "username" | "role">;
export type UserUpdateResult =
    | { status: "updated"; user: PublicUser }
    | { status: "not_found" }
    | { status: "last_admin" };

export interface UserRepository {
    create(data: Prisma.UserCreateInput): Promise<PublicUser>;
    list(options: { skip: number; take: number; search?: string }): Promise<PublicUser[]>;
    findById(id: number): Promise<PublicUser | null>;
    findCredentialsById(id: number): Promise<UserCredentials | null>;
    updatePreservingLastAdmin(id: number, data: UserUpdateData): Promise<UserUpdateResult>;
    updatePasswordAndRevokeTokens(id: number, passwordHash: string): Promise<void>;
    deletePreservingLastAdmin(id: number): Promise<"deleted" | "not_found" | "last_admin">;
}

const publicUserSelect = {
    id: true,
    email: true,
    username: true,
    role: true,
    createdAt: true,
    updatedAt: true,
} as const;

export class PrismaUserRepository implements UserRepository {
    create(data: Prisma.UserCreateInput) {
        return prisma.user.create({
            data,
            select: publicUserSelect,
        });
    }

    list({ skip, take, search }: { skip: number; take: number; search?: string }) {
        return prisma.user.findMany({
            ...(search
                ? {
                      where: {
                          OR: [
                              { username: { contains: search, mode: "insensitive" } },
                              { email: { contains: search, mode: "insensitive" } },
                          ],
                      },
                  }
                : {}),
            select: publicUserSelect,
            orderBy: { id: "asc" },
            skip,
            take,
        });
    }

    findCredentialsById(id: number) {
        return prisma.user.findUnique({
            where: { id },
            select: { id: true, passwordHash: true },
        });
    }

    findById(id: number) {
        return prisma.user.findUnique({
            where: { id },
            select: publicUserSelect,
        });
    }

    updatePreservingLastAdmin(id: number, data: UserUpdateData): Promise<UserUpdateResult> {
        return prisma.$transaction(async (tx) => {
            await tx.$executeRaw`LOCK TABLE "User" IN SHARE ROW EXCLUSIVE MODE`;
            const existing = await tx.user.findUnique({
                where: { id },
                select: { id: true, role: true },
            });
            if (!existing) return { status: "not_found" };

            if (existing.role === "ADMIN" && data.role === "OPERATOR") {
                const adminCount = await tx.user.count({ where: { role: "ADMIN" } });
                if (adminCount <= 1) return { status: "last_admin" };
            }

            const user = await tx.user.update({
                where: { id },
                data,
                select: publicUserSelect,
            });
            return { status: "updated", user };
        });
    }

    async updatePasswordAndRevokeTokens(id: number, passwordHash: string): Promise<void> {
        await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id },
                data: { passwordHash },
                select: { id: true },
            });
            await tx.authToken.updateMany({
                where: { userId: id, revoked: false },
                data: { revoked: true },
            });
        });
    }

    deletePreservingLastAdmin(id: number): Promise<"deleted" | "not_found" | "last_admin"> {
        return prisma.$transaction(async (tx) => {
            await tx.$executeRaw`LOCK TABLE "User" IN SHARE ROW EXCLUSIVE MODE`;
            const user = await tx.user.findUnique({
                where: { id },
                select: { id: true, role: true },
            });
            if (!user) return "not_found";

            if (user.role === "ADMIN") {
                const adminCount = await tx.user.count({ where: { role: "ADMIN" } });
                if (adminCount <= 1) return "last_admin";
            }

            await tx.user.delete({ where: { id }, select: { id: true } });
            return "deleted";
        });
    }
}
