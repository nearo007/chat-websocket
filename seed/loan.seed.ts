import { prisma } from "./prisma.js";

type LoanConfig = {
  clientEmail: string;
  itemName: string;
  loanQuantity: number;
  loanDaysAgo: number;
  dueDaysAfterLoan: number;
  returned: boolean;
};

const loanConfigs: LoanConfig[] = [
  { clientEmail: "joao.silva@email.com", itemName: "Impressora 3D Prusa i3", loanQuantity: 1, loanDaysAgo: 2, dueDaysAfterLoan: 7, returned: false },
  { clientEmail: "maria.santos@email.com", itemName: "Arduino Mega 2560", loanQuantity: 3, loanDaysAgo: 5, dueDaysAfterLoan: 14, returned: false },
  { clientEmail: "pedro.costa@email.com", itemName: "Furadeira Elétrica", loanQuantity: 1, loanDaysAgo: 10, dueDaysAfterLoan: 5, returned: true },
  { clientEmail: "ana.oliveira@email.com", itemName: "Kit de Sensores", loanQuantity: 2, loanDaysAgo: 1, dueDaysAfterLoan: 5, returned: false },
  { clientEmail: "carlos.pereira@email.com", itemName: "Multímetro Digital", loanQuantity: 4, loanDaysAgo: 3, dueDaysAfterLoan: 7, returned: false },
];

export async function seed() {
  const now = new Date();

  for (const cfg of loanConfigs) {
    const client = await prisma.client.findUnique({ where: { email: cfg.clientEmail } });
    if (!client) throw new Error(`Cliente não encontrado: ${cfg.clientEmail}`);

    const item = await prisma.item.findFirst({ where: { name: cfg.itemName } });
    if (!item) throw new Error(`Item não encontrado: ${cfg.itemName}`);

    const loanDate = new Date(now);
    loanDate.setDate(loanDate.getDate() - cfg.loanDaysAgo);

    const dueDate = new Date(loanDate);
    dueDate.setDate(dueDate.getDate() + cfg.dueDaysAfterLoan);

    const returnDate = cfg.returned ? new Date() : null;

    await prisma.$transaction(async (tx) => {
      await tx.loan.create({
        data: {
          clientId: client.id,
          itemId: item.id,
          loanDate,
          dueDate,
          returnDate,
          loanQuantity: cfg.loanQuantity,
        },
      });

      if (!cfg.returned) {
        await tx.item.update({
          where: { id: item.id },
          data: { availableQuantity: { decrement: cfg.loanQuantity } },
        });
      }
    });
  }

  console.log(`  ${loanConfigs.length} empréstimos criados`);
}
