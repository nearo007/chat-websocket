import { prisma } from "@src/lib/prisma.js";
import type { Loan, Prisma } from "@src/generated/prisma/client.js";

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

export type CreateLoanResult =
    | { kind: "created"; loan: Loan }
    | { kind: "item-not-found" }
    | { kind: "insufficient-stock"; availableQuantity: number };

export type UpdateLoanResult =
    | { kind: "updated"; loan: Loan }
    | { kind: "not-found" }
    | { kind: "insufficient-stock"; availableQuantity: number };

export type DeleteLoanResult =
    | { kind: "deleted" }
    | { kind: "not-found" };

export interface LoanRepository {
    createWithStockReservation(data: LoanCreateData): Promise<CreateLoanResult>;
    list(): Promise<Loan[]>;
    findById(id: number): Promise<Loan | null>;
    updateWithStock(id: number, data: LoanUpdateData): Promise<UpdateLoanResult>;
    deleteWithStock(id: number): Promise<DeleteLoanResult>;
}

export class PrismaLoanRepository implements LoanRepository {
    async createWithStockReservation(
        data: LoanCreateData,
    ): Promise<CreateLoanResult> {
        return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const item = await tx.item.findUnique({
                where: { id: data.itemId },
                select: { id: true, availableQuantity: true },
            });

            if (!item) {
                return { kind: "item-not-found" as const };
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
                    return {
                        kind: "insufficient-stock" as const,
                        availableQuantity: item.availableQuantity,
                    };
                }
            }

            const loan = await tx.loan.create({ data });
            return { kind: "created" as const, loan };
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
    ): Promise<UpdateLoanResult> {
        return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const existing = await tx.loan.findUnique({ where: { id } });

            if (!existing) {
                return { kind: "not-found" as const };
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

                    return {
                        kind: "insufficient-stock" as const,
                        availableQuantity: item?.availableQuantity ?? 0,
                    };
                }
            }

            const loan = await tx.loan.update({ where: { id }, data });
            return { kind: "updated" as const, loan };
        });
    }

    async deleteWithStock(id: number): Promise<DeleteLoanResult> {
        return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const existing = await tx.loan.findUnique({ where: { id } });

            if (!existing) {
                return { kind: "not-found" as const };
            }

            if (existing.returnDate === null) {
                await tx.item.update({
                    where: { id: existing.itemId },
                    data: { availableQuantity: { increment: existing.loanQuantity } },
                    select: { id: true },
                });
            }

            await tx.loan.delete({ where: { id }, select: { id: true } });
            return { kind: "deleted" as const };
        });
    }
}
