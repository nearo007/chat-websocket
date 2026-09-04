import { createUserSchema } from "../src/modules/user/user.schemas.js";
import { Bcrypt } from "../src/shared/utils/bcrypt.js";
import { prisma } from "./prisma.js";

async function main() {
    const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
    if (password && /replace|change/i.test(password)) {
        throw new Error("Substitua a senha de exemplo antes de criar o administrador.");
    }
    const input = createUserSchema.parse({
        username: process.env.BOOTSTRAP_ADMIN_USERNAME,
        email: process.env.BOOTSTRAP_ADMIN_EMAIL,
        password,
        passwordConfirm: password,
        role: "ADMIN",
    });
    const passwordHash = await Bcrypt.hashPassword(input.password);

    const result = await prisma.$transaction(async (database) => {
        await database.$executeRaw`LOCK TABLE "User" IN SHARE ROW EXCLUSIVE MODE`;
        const adminCount = await database.user.count({ where: { role: "ADMIN" } });
        if (adminCount > 0) return "already_exists" as const;

        await database.user.create({
            data: {
                username: input.username,
                email: input.email,
                passwordHash,
                role: "ADMIN",
            },
            select: { id: true },
        });
        return "created" as const;
    });

    if (result === "already_exists") {
        throw new Error("Já existe um administrador. Crie os demais usuários pela API.");
    }

    console.log(`Administrador ${input.email} criado com sucesso.`);
}

main()
    .catch((error) => {
        console.error("Não foi possível criar o administrador inicial:", error);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
