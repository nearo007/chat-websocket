import type {
    CreateLoanDTO,
    LoanDTO,
} from "@modules/loan/loan.dtos.js";
import { CreateLoanValidator } from "./input-validation/create-loan.validator.js";
import { UpdateLoanValidator } from "./input-validation/update-loan.validator.js";
import { MESSAGES } from "@src/constants/messages.js";
import { InsufficientStockError } from "@src/shared/errors/insufficient-stock.error.js";
import { AppError } from "@src/shared/errors/app.error.js";
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

        try {
            const loan = await this.loanRepository.createWithStockReservation({
                loanDate: new Date(data.loanDate),
                dueDate: new Date(data.dueDate),
                returnDate: data.returnDate ? new Date(data.returnDate) : null,
                loanQuantity: data.loanQuantity,
                clientId: data.clientId,
                itemId: data.itemId,
            });

            if (!loan) {
                throw new AppError(MESSAGES.ITEM.NOT_FOUND.GENERAL, 404);
            }

            return loan;
        } catch (error) {
            if (error instanceof InsufficientStockError) {
                throw new AppError(
                    MESSAGES.LOAN.VALIDATION.QUANTITY_TOO_BIG(
                        error.availableQuantity,
                    ),
                );
            }

            throw error;
        }
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
        const existing = await this.loanRepository.findById(id);
        if (!existing) {
            throw new AppError(MESSAGES.LOAN.NOT_FOUND.BY_ID, 404);
        }

        UpdateLoanValidator.validate(data, existing);

        try {
            const loan = await this.loanRepository.updateWithStock(id, data);

            if (!loan) {
                throw new AppError(MESSAGES.LOAN.NOT_FOUND.BY_ID, 404);
            }

            return loan;
        } catch (error) {
            if (error instanceof InsufficientStockError) {
                throw new AppError(
                    MESSAGES.LOAN.VALIDATION.QUANTITY_TOO_BIG(
                        error.availableQuantity,
                    ),
                );
            }

            throw error;
        }
    }

    async deleteById(id: number): Promise<void> {
        const loan = await this.loanRepository.deleteWithStock(id);

        if (!loan) {
            throw new AppError(MESSAGES.LOAN.NOT_FOUND.BY_ID, 404);
        }
    }
}

const loanService = new LoanService();
export { loanService };
