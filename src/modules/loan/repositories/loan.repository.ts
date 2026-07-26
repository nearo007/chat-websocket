import { prisma } from "@src/lib/prisma.js";
import type { Loan, Prisma } from "@src/generated/prisma/client.js";
import { InsufficientStockError } from "@src/shared/errors/insufficient-stock.error.js";

export type LoanCreateData = {
    clientId: number;
    itemId: number;
    loanDate: Date;
    dueDate: Date;
    loanQuantity: number;
    returnDate: Date | null;
};

export type LoanUpdateData = {
    loanDate?: Date;
    dueDate?: Date;
    returnDate?: Date | null;
};

export interface LoanRepository {
    createWithStockReservation(data: LoanCreateData): Promise<Loan | null>;
    list(): Promise<Loan[]>;
    findById(id: number): Promise<Loan | null>;
    updateWithStock(id: number, data: LoanUpdateData): Promise<Loan | null>;
    deleteWithStock(id: number): Promise<Loan | null>;
}

export class PrismaLoanRepository implements LoanRepository {
    async createWithStockReservation(
        data: LoanCreateData,
    ): Promise<Loan | null> {
        return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const item = await tx.item.findUnique({
                where: { id: data.itemId },
                select: { id: true, availableQuantity: true },
            });

            if (!item) {
                return null;
            }

            if (data.returnDate === null) {
                const reserved = await tx.item.updateMany({
                    where: {
                        id: data.itemId,
                        availableQuantity: { gte: data.loanQuantity },
                    },
                    data: { availableQuantity: { decrement: data.loanQuantity } },
                });

                if (reserved.count !== 1) {
                    throw new InsufficientStockError(item.availableQuantity);
                }
            }

            return tx.loan.create({ data });
        });
    }

    list() {
        return prisma.loan.findMany();
    }

    findById(id: number) {
        return prisma.loan.findUnique({ where: { id } });
    }

    async updateWithStock(
        id: number,
        data: LoanUpdateData,
    ): Promise<Loan | null> {
        return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const existing = await tx.loan.findUnique({ where: { id } });

            if (!existing) {
                return null;
            }

            const isBeingReturned =
                existing.returnDate === null &&
                data.returnDate !== undefined &&
                data.returnDate !== null;
            const isBeingReopened =
                existing.returnDate !== null && data.returnDate === null;

            if (isBeingReturned) {
                await tx.item.update({
                    where: { id: existing.itemId },
                    data: { availableQuantity: { increment: existing.loanQuantity } },
                    select: { id: true },
                });
            }

            if (isBeingReopened) {
                const reserved = await tx.item.updateMany({
                    where: {
                        id: existing.itemId,
                        availableQuantity: { gte: existing.loanQuantity },
                    },
                    data: { availableQuantity: { decrement: existing.loanQuantity } },
                });

                if (reserved.count !== 1) {
                    const item = await tx.item.findUnique({
                        where: { id: existing.itemId },
                        select: { availableQuantity: true },
                    });

                    throw new InsufficientStockError(
                        item?.availableQuantity ?? 0,
                    );
                }
            }

            return tx.loan.update({ where: { id }, data });
        });
    }

    async deleteWithStock(id: number): Promise<Loan | null> {
        return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const existing = await tx.loan.findUnique({ where: { id } });

            if (!existing) {
                return null;
            }

            if (existing.returnDate === null) {
                await tx.item.update({
                    where: { id: existing.itemId },
                    data: { availableQuantity: { increment: existing.loanQuantity } },
                    select: { id: true },
                });
            }

            await tx.loan.delete({ where: { id }, select: { id: true } });
            return existing;
        });
    }
}
