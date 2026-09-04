export class RelatedResourceNotFoundError extends Error {
    constructor(readonly resource: "client" | "item") {
        super(`${resource} not found`);
        this.name = "RelatedResourceNotFoundError";
    }
}

export class LoanCancelledError extends Error {
    constructor() {
        super("Loan is cancelled");
        this.name = "LoanCancelledError";
    }
}

export class LoanDateOrderError extends Error {
    constructor(readonly field: "dueDate" | "returnDate") {
        super(`${field} precedes loanDate`);
        this.name = "LoanDateOrderError";
    }
}
