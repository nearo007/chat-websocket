import bcrypt from "bcrypt";

export class Bcrypt {
    static hashPassword(password: string) {
        const SALT_ROUNDS = 12;
        return bcrypt.hash(password, SALT_ROUNDS);
    }

    static comparePassword(password: string, hash: string) {
        return bcrypt.compare(password, hash);
    }
}
