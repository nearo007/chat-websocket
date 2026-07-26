import type { Loan } from "@src/generated/prisma/client.js";
import { MESSAGES } from "@src/constants/messages.js";
import type { LoanUpdateData } from "../repositories/loan.repository.js";
import { AppError } from "@src/shared/errors/app.error.js";

export class UpdateLoanValidator {
    static validate(data: LoanUpdateData, existing: Loan) {
        const loanDate = data.loanDate ?? existing.loanDate;
        const dueDate = data.dueDate ?? existing.dueDate;
        const returnDate = data.returnDate ?? existing.returnDate;

        if (dueDate < loanDate) {
            throw new AppError(MESSAGES.LOAN.VALIDATION.DUE_DATE_BEFORE_LOAN);
        }

        if (returnDate !== null && returnDate !== undefined && returnDate < loanDate) {
            throw new AppError(MESSAGES.LOAN.VALIDATION.RETURN_DATE_BEFORE_LOAN);
        }
    }
}
