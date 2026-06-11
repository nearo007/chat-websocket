export type MovementDTO = {
    id: number;
    type: "ENTRADA" | "SAIDA";
    quantity: number;
    reason: string | null;
    createdAt: Date;
    itemId: number;
    loanId: number | null;
};

export type CreateMovementDTO = {
    type: "ENTRADA" | "SAIDA";
    quantity: number;
    itemId: number;
    reason?: string;
};
