export class AppError extends Error {
    constructor(
        message: string,
        readonly statusCode: number = 400,
        readonly code: string = "REQUEST_ERROR",
    ) {
        super(message);
        this.name = "AppError";
    }
}
