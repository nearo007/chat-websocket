import type { CreateLoanDTO, LoanDTO } from "@modules/loan/loan.dtos.js";
import { MESSAGES } from "@src/constants/messages.js";
import { AppError } from "@src/shared/errors/app.error.js";
import { InsufficientStockError } from "@src/shared/errors/insufficient-stock.error.js";
import {
    LoanCancelledError,
    LoanDateOrderError,
    RelatedResourceNotFoundError,
} from "@src/shared/errors/loan-state.error.js";
import { CreateLoanValidator } from "./input-validation/create-loan.validator.js";
import { type LoanRepository, PrismaLoanRepository } from "./repositories/loan.repository.js";

export class LoanService {
    constructor(private readonly loanRepository: LoanRepository = new PrismaLoanRepository()) {}

    async create(data: CreateLoanDTO, actorId: number): Promise<LoanDTO> {
        CreateLoanValidator.validate(data);

        try {
            const loan = await this.loanRepository.createWithStockReservation({
                loanDate: new Date(data.loanDate),
                dueDate: new Date(data.dueDate),
                returnDate: data.returnDate ? new Date(data.returnDate) : null,
                loanQuantity: data.loanQuantity,
                clientId: data.clientId,
                itemId: data.itemId,
                createdById: actorId,
                returnedById: data.returnDate ? actorId : null,
            });

            if (!loan) {
                throw new AppError(MESSAGES.ITEM.NOT_FOUND.GENERAL, 404);
            }

            return loan;
        } catch (error) {
            if (error instanceof InsufficientStockError) {
                throw new AppError(
                    MESSAGES.LOAN.VALIDATION.QUANTITY_TOO_BIG(error.availableQuantity),
                );
            }

            if (error instanceof RelatedResourceNotFoundError) {
                const message =
                    error.resource === "client"
                        ? MESSAGES.CLIENT.NOT_FOUND.BY_ID
                        : MESSAGES.ITEM.NOT_FOUND.BY_ID;
                throw new AppError(message, 404, `${error.resource.toUpperCase()}_NOT_FOUND`);
            }

            throw error;
        }
    }

    async list(options: {
        skip: number;
        take: number;
        status: "all" | "active" | "returned" | "cancelled" | "overdue";
    }): Promise<LoanDTO[]> {
        return this.loanRepository.list(options);
    }

    async getById(id: number): Promise<LoanDTO> {
        const loan = await this.loanRepository.findById(id);
        if (!loan) throw new AppError(MESSAGES.LOAN.NOT_FOUND.BY_ID, 404, "LOAN_NOT_FOUND");
        return loan;
    }

    async updateById(
        id: number,
        data: {
            loanDate?: Date;
            dueDate?: Date;
            returnDate?: Date | null;
        },
        actorId: number,
    ): Promise<LoanDTO> {
        try {
            const loan = await this.loanRepository.updateWithStock(id, data, actorId);

            if (!loan) {
                throw new AppError(MESSAGES.LOAN.NOT_FOUND.BY_ID, 404);
            }

            return loan;
        } catch (error) {
            if (error instanceof InsufficientStockError) {
                throw new AppError(
                    MESSAGES.LOAN.VALIDATION.QUANTITY_TOO_BIG(error.availableQuantity),
                );
            }

            if (error instanceof LoanCancelledError) {
                throw new AppError(
                    "Um empréstimo cancelado não pode ser alterado.",
                    409,
                    "LOAN_CANCELLED",
                );
            }

            if (error instanceof LoanDateOrderError) {
                const message =
                    error.field === "dueDate"
                        ? MESSAGES.LOAN.VALIDATION.DUE_DATE_BEFORE_LOAN
                        : MESSAGES.LOAN.VALIDATION.RETURN_DATE_BEFORE_LOAN;
                throw new AppError(message, 400, "INVALID_LOAN_DATES");
            }

            throw error;
        }
    }

    async cancelById(id: number, actorId: number): Promise<void> {
        const loan = await this.loanRepository.cancelWithStock(id, actorId);

        if (!loan) {
            throw new AppError(MESSAGES.LOAN.NOT_FOUND.BY_ID, 404);
        }
    }
}

const loanService = new LoanService();

export { loanService };
