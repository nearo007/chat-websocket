import type { CreateLoanDTO, UpdateLoanDTO } from "@modules/loan/loan.dtos.js";
import { loanService } from "@modules/loan/loan.service.js";
import { MESSAGES } from "@src/constants/messages.js";
import { DateValidator } from "@src/shared/utils/validators/date.validator.js";
import { IdValidator } from "@src/shared/utils/validators/id.validator.js";
import { paginationFrom } from "@src/shared/validation/fields.js";
import type { Request, Response } from "express";
import { loanListQuerySchema } from "./loan.schemas.js";

class LoanController {
    async create(req: Request, res: Response) {
        const data: CreateLoanDTO = req.body;

        const loan = await loanService.create(data, Number(req.userId));
        return res.status(201).json(loan);
    }

    async list(req: Request, res: Response) {
        const query = loanListQuerySchema.parse(req.query);
        const loans = await loanService.list({
            ...paginationFrom(query),
            status: query.status,
        });
        return res.json(loans);
    }

    async getById(req: Request, res: Response) {
        const id = Number(req.params.id);
        IdValidator.validate(id);
        const loan = await loanService.getById(id);
        return res.json(loan);
    }

    async updateById(req: Request, res: Response) {
        const loanId = Number(req.params.id);
        IdValidator.validate(loanId);
        const data: UpdateLoanDTO = req.body;

        const updateData: {
            loanDate?: Date;
            dueDate?: Date;
            returnDate?: Date | null;
        } = {};

        if (data.loanDate !== undefined) {
            DateValidator.validate(data.loanDate, MESSAGES.FIELDS.LOAN_DATE);
            updateData.loanDate = new Date(data.loanDate);
        }

        if (data.dueDate !== undefined) {
            DateValidator.validate(data.dueDate, MESSAGES.FIELDS.DUE_DATE);
            updateData.dueDate = new Date(data.dueDate);
        }

        if (data.returnDate !== undefined) {
            if (data.returnDate !== null) {
                DateValidator.validate(data.returnDate, MESSAGES.FIELDS.RETURN_DATE);
            }
            updateData.returnDate = data.returnDate === null ? null : new Date(data.returnDate);
        }

        const loan = await loanService.updateById(loanId, updateData, Number(req.userId));

        return res.json(loan);
    }

    async deleteById(req: Request, res: Response) {
        const loanId = Number(req.params.id);
        IdValidator.validate(loanId);
        await loanService.cancelById(loanId, Number(req.userId));
        return res.status(204).send();
    }
}

const loanController = new LoanController();

export { loanController };
