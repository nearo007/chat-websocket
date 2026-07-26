import { prisma } from "@src/lib/prisma.js";
import type { Prisma, User } from "@src/generated/prisma/client.js";
import type { UserRole } from "@src/shared/auth/roles.js";

export type PublicUser = Pick<User, "id" | "email" | "username"> & {
    role: UserRole;
};

export interface UserRepository {
    create(data: Prisma.UserCreateInput): Promise<PublicUser>;
    list(): Promise<PublicUser[]>;
    findById(id: number): Promise<PublicUser | null>;
    update(id: number, data: Prisma.UserUpdateInput): Promise<PublicUser>;
    updatePassword(id: number, passwordHash: string): Promise<void>;
    delete(id: number): Promise<void>;
}

const publicUserSelect = {
    id: true,
    email: true,
    username: true,
    role: true,
} as const;

export class PrismaUserRepository implements UserRepository {
    create(data: Prisma.UserCreateInput) {
        return prisma.user.create({
            data,
            select: publicUserSelect,
        });
    }

    list() {
        return prisma.user.findMany({ select: publicUserSelect });
    }

    findById(id: number) {
        return prisma.user.findUnique({
            where: { id },
            select: publicUserSelect,
        });
    }

    update(id: number, data: Prisma.UserUpdateInput) {
        return prisma.user.update({
            where: { id },
            data,
            select: publicUserSelect,
        });
    }

    async updatePassword(id: number, passwordHash: string): Promise<void> {
        await prisma.user.update({
            where: { id },
            data: { passwordHash },
            select: { id: true },
        });
    }

    async delete(id: number): Promise<void> {
        await prisma.user.delete({ where: { id }, select: { id: true } });
    }
}
