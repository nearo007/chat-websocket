import type { CreateLoanDTO } from "@modules/loan/loan.dtos.js";
import { MESSAGES } from "@src/constants/messages.js";
import { AppError } from "@src/shared/errors/app.error.js";
import { DateValidator } from "@src/shared/utils/validators/date.validator.js";
import { IdValidator } from "@src/shared/utils/validators/id.validator.js";
import { QuantityValidator } from "@src/shared/utils/validators/quantity.validator.js";

export class CreateLoanValidator {
    static validate(data: CreateLoanDTO) {
        IdValidator.validate(data.itemId);
        IdValidator.validate(data.clientId);
        DateValidator.validate(data.loanDate, MESSAGES.FIELDS.LOAN_DATE);
        DateValidator.validate(data.dueDate, MESSAGES.FIELDS.DUE_DATE);
        QuantityValidator.validate(data.loanQuantity, 1);

        const loanDate = new Date(data.loanDate);
        const dueDate = new Date(data.dueDate);
        if (dueDate < loanDate) {
            throw new AppError(MESSAGES.LOAN.VALIDATION.DUE_DATE_BEFORE_LOAN);
        }

        if (data.returnDate) {
            DateValidator.validate(data.returnDate, MESSAGES.FIELDS.RETURN_DATE);
            if (new Date(data.returnDate) < loanDate) {
                throw new AppError(MESSAGES.LOAN.VALIDATION.RETURN_DATE_BEFORE_LOAN);
            }
        }
    }
}
