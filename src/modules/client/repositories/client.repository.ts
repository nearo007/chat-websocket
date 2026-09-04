import type { Client, Item, Loan, Prisma } from "@src/generated/prisma/client.js";
import { prisma } from "@src/lib/prisma.js";

export type ClientLoanHistory = Client & {
    loans: Array<Loan & { item: Item }>;
};

export interface ClientRepository {
    create(data: Prisma.ClientCreateInput): Promise<Client>;
    list(options: { skip: number; take: number; search?: string }): Promise<Client[]>;
    findById(id: number): Promise<Client | null>;
    update(id: number, data: Prisma.ClientUpdateInput): Promise<Client>;
    getLoanHistory(
        id: number,
        pagination: { skip: number; take: number },
    ): Promise<ClientLoanHistory | null>;
    delete(id: number): Promise<void>;
}

export class PrismaClientRepository implements ClientRepository {
    create(data: Prisma.ClientCreateInput) {
        return prisma.client.create({ data });
    }

    list({ skip, take, search }: { skip: number; take: number; search?: string }) {
        return prisma.client.findMany({
            ...(search
                ? {
                      where: {
                          OR: [
                              { name: { contains: search, mode: "insensitive" } },
                              { email: { contains: search, mode: "insensitive" } },
                          ],
                      },
                  }
                : {}),
            orderBy: { id: "asc" },
            skip,
            take,
        });
    }

    findById(id: number) {
        return prisma.client.findUnique({ where: { id } });
    }

    update(id: number, data: Prisma.ClientUpdateInput) {
        return prisma.client.update({ where: { id }, data });
    }

    getLoanHistory(id: number, { skip, take }: { skip: number; take: number }) {
        return prisma.client.findUnique({
            where: { id },
            include: {
                loans: {
                    include: { item: true },
                    orderBy: { loanDate: "desc" },
                    skip,
                    take,
                },
            },
        });
    }

    async delete(id: number): Promise<void> {
        await prisma.client.delete({ where: { id }, select: { id: true } });
    }
}
