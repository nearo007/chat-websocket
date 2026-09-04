import type { SeedDatabase } from "./types.js";

type SeedItem = {
    name: string;
    category: string;
    totalQuantity: number;
    availableQuantity: number;
    location: string;
};

const items: SeedItem[] = [
    {
        name: "Impressora 3D Prusa i3",
        category: "Eletrónica",
        totalQuantity: 3,
        availableQuantity: 3,
        location: "Oficina A",
    },
    {
        name: "Arduino Mega 2560",
        category: "Eletrónica",
        totalQuantity: 15,
        availableQuantity: 15,
        location: "Oficina A",
    },
    {
        name: "Kit de Sensores",
        category: "Eletrónica",
        totalQuantity: 10,
        availableQuantity: 10,
        location: "Oficina B",
    },
    {
        name: "Serra Circular",
        category: "Ferramentas",
        totalQuantity: 2,
        availableQuantity: 2,
        location: "Oficina A",
    },
    {
        name: "Furadeira Elétrica",
        category: "Ferramentas",
        totalQuantity: 4,
        availableQuantity: 4,
        location: "Oficina B",
    },
    {
        name: "Notebook Dell Latitude",
        category: "Informática",
        totalQuantity: 5,
        availableQuantity: 5,
        location: "Sala 101",
    },
    {
        name: "Raspberry Pi 4",
        category: "Informática",
        totalQuantity: 8,
        availableQuantity: 8,
        location: "Sala 102",
    },
    {
        name: "Multímetro Digital",
        category: "Eletrónica",
        totalQuantity: 12,
        availableQuantity: 12,
        location: "Oficina B",
    },
];

export async function seed(database: SeedDatabase) {
    for (const item of items) {
        await database.item.create({ data: item });
    }

    console.log(`  ${items.length} itens criados`);
}
