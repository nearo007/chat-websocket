export type LoanDTO = {
    id: number;
    clientId: number;
    itemId: number;
    loanDate: Date;
    dueDate: Date;
    loanQuantity: number;
    returnDate: Date | null;
    cancelledAt: Date | null;
    createdById: number | null;
    returnedById: number | null;
    cancelledById: number | null;
    createdAt: Date;
    updatedAt: Date;
};

export type CreateLoanDTO = {
    clientId: number;
    itemId: number;
    loanDate: string;
    dueDate: string;
    loanQuantity: number;
    returnDate?: string | null;
};

export type UpdateLoanDTO = {
    loanDate?: string;
    dueDate?: string;
    returnDate?: string | null;
};
