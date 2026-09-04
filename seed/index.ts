import readline from "node:readline";
import { seed as seedClients } from "./client.seed.js";
import { seed as seedItems } from "./item.seed.js";
import { seed as seedLoans } from "./loan.seed.js";
import { prisma } from "./prisma.js";
import { seed as seedUsers } from "./user.seed.js";

function askYesNo(question: string): Promise<boolean> {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
        rl.question(`${question} (y/N) `, (answer) => {
            rl.close();
            resolve(answer.trim().toLowerCase() === "y" || answer.trim().toLowerCase() === "yes");
        });
    });
}

import type { SeedDatabase } from "./types.js";

async function clean(database: SeedDatabase) {
    console.log("  A limpar dados existentes...");
    await database.authToken.deleteMany();
    await database.loan.deleteMany();
    await database.inventoryAdjustment.deleteMany();
    await database.client.deleteMany();
    await database.item.deleteMany();
    await database.user.deleteMany();
    console.log("  Dados existentes removidos");
}

async function main() {
    console.log("\nSeed da base de dados\n");

    const confirmed =
        process.argv.includes("--yes") ||
        (await askYesNo("Pretende apagar os dados existentes e semear novamente?"));
    if (!confirmed) {
        console.log("  Operação cancelada.\n");
        process.exit(0);
    }

    await prisma.$transaction(
        async (database) => {
            await clean(database);

            console.log("\n  A semear dados...\n");

            await seedUsers(database);
            await seedClients(database);
            await seedItems(database);
            await seedLoans(database);
        },
        { timeout: 30_000 },
    );

    console.log("\n  Seed concluído com sucesso\n");
}

main()
    .catch((err) => {
        console.error("\n  Erro durante o seed:", err, "\n");
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
