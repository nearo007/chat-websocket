import { prisma } from "@lib/prisma.js";
import type {
    CreateLoanDTO,
    LoanDTO,
    UpdateLoanDTO,
} from "@modules/loan/loan.dtos.js";
import { CreateLoanValidator } from "./input-validation/create-loan.validator.js";
import { MESSAGES } from "@src/constants/messages.js";
import { movementService } from "@modules/movement/movement.service.js";

class LoanService {
    async create(data: CreateLoanDTO): Promise<LoanDTO> {
        CreateLoanValidator.validate(data);

        const item = await prisma.item.findFirst({
            where: { id: data.itemId },
        });

        if (!item) {
            throw new Error(MESSAGES.ITEM.NOT_FOUND.GENERAL);
        }

        const activeLoans = await prisma.loan.aggregate({
            where: { itemId: data.itemId, returnDate: null },
            _sum: { loanQuantity: true },
        });

        const loanedQuantity = activeLoans._sum.loanQuantity ?? 0;
        const availableQuantity = item.totalQuantity - loanedQuantity;

        if (data.loanQuantity > availableQuantity) {
            throw new Error(
                MESSAGES.LOAN.VALIDATION.QUANTITY_TOO_BIG(availableQuantity),
            );
        }

        const loan = await prisma.loan.create({
            data: {
                loanDate: new Date(data.loanDate),
                dueDate: new Date(data.dueDate),
                returnDate: data.returnDate ? new Date(data.returnDate) : null,
                loanQuantity: data.loanQuantity,
                clientId: data.clientId,
                itemId: data.itemId,
            },
        });

        await movementService.create(
            { type: "SAIDA", quantity: data.loanQuantity, itemId: data.itemId, reason: "Empréstimo registrado" },
            loan.id,
        );

        return loan;
    }

    async list(): Promise<LoanDTO[]> {
        const loans = await prisma.loan.findMany();
        return loans;
    }

    async getById(id: number): Promise<LoanDTO | null> {
        const loan = await prisma.loan.findUnique({ where: { id } });
        return loan;
    }

    async updateById(
        id: number,
        data: {
            loanDate?: Date;
            dueDate?: Date;
            returnDate?: Date | null;
        },
    ): Promise<LoanDTO> {
        const existing = await prisma.loan.findUnique({ where: { id } });
        if (!existing) {
            throw new Error(MESSAGES.LOAN.NOT_FOUND.BY_ID);
        }

        const loan = await prisma.loan.update({
            where: { id },
            data,
        });

        if (!existing.returnDate && data.returnDate) {
            await movementService.create(
                { type: "ENTRADA", quantity: existing.loanQuantity, itemId: existing.itemId, reason: "Devolução registrada" },
                id,
            );
        }

        return loan;
    }

    async deleteById(id: number): Promise<void> {
        const existing = await prisma.loan.findUnique({ where: { id } });

        if (existing && !existing.returnDate) {
            await movementService.create(
                { type: "ENTRADA", quantity: existing.loanQuantity, itemId: existing.itemId, reason: "Empréstimo cancelado" },
                id,
            );
        }

        await prisma.loan.delete({ where: { id } });
    }
}

const loanService = new LoanService();
export { loanService };
