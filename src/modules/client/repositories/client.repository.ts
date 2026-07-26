import { prisma } from "@src/lib/prisma.js";
import type {
    Client,
    Item,
    Loan,
    Prisma,
} from "@src/generated/prisma/client.js";

export type ClientLoanHistory = Client & {
    loans: Array<Loan & { item: Item }>;
};

export interface ClientRepository {
    create(data: Prisma.ClientCreateInput): Promise<Client>;
    list(): Promise<Client[]>;
    findById(id: number): Promise<Client | null>;
    update(id: number, data: Prisma.ClientUpdateInput): Promise<Client>;
    getLoanHistory(id: number): Promise<ClientLoanHistory | null>;
    delete(id: number): Promise<void>;
}

export class PrismaClientRepository implements ClientRepository {
    create(data: Prisma.ClientCreateInput) {
        return prisma.client.create({ data });
    }

    list() {
        return prisma.client.findMany();
    }

    findById(id: number) {
        return prisma.client.findUnique({ where: { id } });
    }

    update(id: number, data: Prisma.ClientUpdateInput) {
        return prisma.client.update({ where: { id }, data });
    }

    getLoanHistory(id: number) {
        return prisma.client.findUnique({
            where: { id },
            include: {
                loans: {
                    include: { item: true },
                    orderBy: { loanDate: "desc" },
                },
            },
        });
    }

    async delete(id: number): Promise<void> {
        await prisma.client.delete({ where: { id }, select: { id: true } });
    }
}
