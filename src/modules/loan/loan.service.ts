import { prisma } from "@lib/prisma.js";
import type {
    CreateLoanDTO,
    LoanDTO,
    UpdateLoanDTO,
} from "@modules/loan/loan.dtos.js";
import { CreateLoanValidator } from "./input-validation/create-loan.validator.js";
import { MESSAGES } from "@src/constants/messages.js";
import { itemService } from "../item/item.service.js";

class LoanService {
    async create(data: CreateLoanDTO): Promise<LoanDTO> {
        CreateLoanValidator.validate(data);

        const item = await prisma.item.findFirst({
            where: { id: data.itemId },
        });

        if (!item) {
            throw new Error(MESSAGES.ITEM.NOT_FOUND.GENERAL);
        }

        if (data.loanQuantity > item.availableQuantity) {
            throw new Error(
                MESSAGES.LOAN.VALIDATION.QUANTITY_TOO_BIG(
                    item.availableQuantity,
                ),
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

        const availableQuantity = item.availableQuantity - data.loanQuantity;

        await itemService.updateById(data.itemId, {
            availableQuantity,
        });

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
        const loan = await prisma.loan.update({
            where: { id },
            data,
        });

        return loan;
    }

    async deleteById(id: number): Promise<void> {
        await prisma.loan.delete({ where: { id } });
    }
}

const loanService = new LoanService();
export { loanService };

