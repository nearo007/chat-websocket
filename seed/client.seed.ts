import type { SeedDatabase } from "./types.js";

type SeedClient = {
    name: string;
    email: string;
    phone: string;
};

const clients: SeedClient[] = [
    { name: "João Silva", email: "joao.silva@email.com", phone: "912345678" },
    { name: "Maria Santos", email: "maria.santos@email.com", phone: "923456789" },
    { name: "Pedro Costa", email: "pedro.costa@email.com", phone: "934567890" },
    { name: "Ana Oliveira", email: "ana.oliveira@email.com", phone: "945678901" },
    { name: "Carlos Pereira", email: "carlos.pereira@email.com", phone: "956789012" },
];

export async function seed(database: SeedDatabase) {
    for (const client of clients) {
        await database.client.create({ data: client });
    }

    console.log(`  ${clients.length} clientes criados`);
}
