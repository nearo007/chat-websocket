import readline from "readline";
import { prisma } from "./prisma.js";
import { seed as seedUsers } from "./user.seed.js";
import { seed as seedClients } from "./client.seed.js";
import { seed as seedItems } from "./item.seed.js";
import { seed as seedLoans } from "./loan.seed.js";

function askYesNo(question: string): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`${question} (y/N) `, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === "y" || answer.trim().toLowerCase() === "yes");
    });
  });
}

async function clean() {
  console.log("  A limpar dados existentes...");
  await prisma.authToken.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.client.deleteMany();
  await prisma.item.deleteMany();
  await prisma.user.deleteMany();
  console.log("  Dados existentes removidos");
}

async function main() {
  console.log("\nSeed da base de dados\n");

  const confirmed = await askYesNo("Pretende apagar os dados existentes e semear novamente?");
  if (!confirmed) {
    console.log("  Operação cancelada.\n");
    process.exit(0);
  }

  await clean();

  console.log("\n  A semear dados...\n");

  await seedUsers();
  await seedClients();
  await seedItems();
  await seedLoans();

  console.log("\n  Seed concluído com sucesso\n");
}

main()
  .catch((err) => {
    console.error("\n  Erro durante o seed:", err, "\n");
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
