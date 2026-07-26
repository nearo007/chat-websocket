import type {
    CreateLoanDTO,
    LoanDTO,
    UpdateLoanDTO,
} from "@modules/loan/loan.dtos.js";
import { CreateLoanValidator } from "./input-validation/create-loan.validator.js";
import { MESSAGES } from "@src/constants/messages.js";
import {
    PrismaLoanRepository,
    type LoanRepository,
} from "./repositories/loan.repository.js";

class LoanService {
    constructor(
        private readonly loanRepository: LoanRepository =
            new PrismaLoanRepository(),
    ) {}

    async create(data: CreateLoanDTO): Promise<LoanDTO> {
        CreateLoanValidator.validate(data);

        const result = await this.loanRepository.createWithStockReservation({
            loanDate: new Date(data.loanDate),
            dueDate: new Date(data.dueDate),
            returnDate: data.returnDate ? new Date(data.returnDate) : null,
            loanQuantity: data.loanQuantity,
            clientId: data.clientId,
            itemId: data.itemId,
        });

        if (result.kind === "item-not-found") {
            throw new Error(MESSAGES.ITEM.NOT_FOUND.GENERAL);
        }

        if (result.kind === "insufficient-stock") {
            throw new Error(
                MESSAGES.LOAN.VALIDATION.QUANTITY_TOO_BIG(
                    result.availableQuantity,
                ),
            );
        }

        return result.loan;
    }

    async list(): Promise<LoanDTO[]> {
        return this.loanRepository.list();
    }

    async getById(id: number): Promise<LoanDTO | null> {
        return this.loanRepository.findById(id);
    }

    async updateById(
        id: number,
        data: {
            loanDate?: Date;
            dueDate?: Date;
            returnDate?: Date | null;
        },
    ): Promise<LoanDTO> {
        const result = await this.loanRepository.updateWithStock(id, data);

        if (result.kind === "not-found") {
            throw new Error(MESSAGES.LOAN.NOT_FOUND.BY_ID);
        }

        if (result.kind === "insufficient-stock") {
            throw new Error(
                MESSAGES.LOAN.VALIDATION.QUANTITY_TOO_BIG(
                    result.availableQuantity,
                ),
            );
        }

        return result.loan;
    }

    async deleteById(id: number): Promise<void> {
        const result = await this.loanRepository.deleteWithStock(id);

        if (result.kind === "not-found") {
            throw new Error(MESSAGES.LOAN.NOT_FOUND.BY_ID);
        }
    }
}

const loanService = new LoanService();
export { loanService };
