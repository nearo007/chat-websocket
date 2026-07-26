export class InsufficientStockError extends Error {
    constructor(readonly availableQuantity: number) {
        super("Insufficient stock");
        this.name = "InsufficientStockError";
    }
}
