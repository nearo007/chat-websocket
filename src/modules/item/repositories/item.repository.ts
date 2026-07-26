import { prisma } from "@src/lib/prisma.js";
import type { Item, Prisma } from "@src/generated/prisma/client.js";

export interface ItemRepository {
    create(data: Prisma.ItemCreateInput): Promise<Item>;
    list(): Promise<Item[]>;
    findById(id: number): Promise<Item | null>;
    listByCategory(category: string): Promise<Item[]>;
    listByLocation(location: string): Promise<Item[]>;
    update(id: number, data: Prisma.ItemUpdateInput): Promise<Item>;
    delete(id: number): Promise<void>;
}

export class PrismaItemRepository implements ItemRepository {
    create(data: Prisma.ItemCreateInput) {
        return prisma.item.create({ data });
    }

    list() {
        return prisma.item.findMany();
    }

    findById(id: number) {
        return prisma.item.findUnique({ where: { id } });
    }

    listByCategory(category: string) {
        return prisma.item.findMany({ where: { category } });
    }

    listByLocation(location: string) {
        return prisma.item.findMany({ where: { location } });
    }

    update(id: number, data: Prisma.ItemUpdateInput) {
        return prisma.item.update({ where: { id }, data });
    }

    async delete(id: number): Promise<void> {
        await prisma.item.delete({ where: { id }, select: { id: true } });
    }
}
