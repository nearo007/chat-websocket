import { Bcrypt } from "../src/shared/utils/bcrypt.js";
import { passwordSchema } from "../src/shared/validation/fields.js";
import type { SeedDatabase } from "./types.js";

type SeedUser = {
    username: string;
    email: string;
    password: string;
    role: "ADMIN" | "OPERATOR";
};

export async function seed(database: SeedDatabase) {
    const adminPassword = process.env.SEED_ADMIN_PASSWORD;
    const operatorPassword = process.env.SEED_OPERATOR_PASSWORD;
    if (!adminPassword || !operatorPassword) {
        throw new Error(
            "Defina SEED_ADMIN_PASSWORD e SEED_OPERATOR_PASSWORD antes de executar o seed.",
        );
    }
    if ([adminPassword, operatorPassword].some((password) => /replace|change/i.test(password))) {
        throw new Error("Substitua as senhas de exemplo por valores próprios antes do seed.");
    }
    passwordSchema.parse(adminPassword);
    passwordSchema.parse(operatorPassword);

    const users: SeedUser[] = [
        { username: "admin", email: "admin@fablab.pt", password: adminPassword, role: "ADMIN" },
        {
            username: "operator",
            email: "operator@fablab.pt",
            password: operatorPassword,
            role: "OPERATOR",
        },
    ];

    const hashedUsers = await Promise.all(
        users.map(async (u) => ({
            username: u.username,
            email: u.email,
            role: u.role,
            passwordHash: await Bcrypt.hashPassword(u.password),
        })),
    );

    for (const user of hashedUsers) {
        await database.user.create({ data: user });
    }

    console.log(`  ${users.length} utilizadores criados`);
}
