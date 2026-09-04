import type { InventoryAdjustment, Item, Prisma } from "@src/generated/prisma/client.js";
import { prisma } from "@src/lib/prisma.js";
import {
    InventoryCapacityError,
    InventoryInvariantError,
} from "@src/shared/errors/inventory-capacity.error.js";

export type ItemUpdateData = {
    name?: string;
    category?: string | null;
    totalQuantity?: number;
    location?: string;
    adjustmentReason?: string;
};

export interface ItemRepository {
    create(data: Prisma.ItemCreateInput): Promise<Item>;
    list(options: { skip: number; take: number; search?: string }): Promise<Item[]>;
    findById(id: number): Promise<Item | null>;
    listByCategory(category: string, pagination: { skip: number; take: number }): Promise<Item[]>;
    listByLocation(location: string, pagination: { skip: number; take: number }): Promise<Item[]>;
    updateWithStockInvariant(
        id: number,
        data: ItemUpdateData,
        actorId: number,
    ): Promise<Item | null>;
    listAdjustments(
        itemId: number,
        pagination: { skip: number; take: number },
    ): Promise<InventoryAdjustment[]>;
    delete(id: number): Promise<void>;
}

export class PrismaItemRepository implements ItemRepository {
    create(data: Prisma.ItemCreateInput) {
        return prisma.item.create({ data });
    }

    list({ skip, take, search }: { skip: number; take: number; search?: string }) {
        return prisma.item.findMany({
            ...(search
                ? {
                      where: {
                          OR: [
                              { name: { contains: search, mode: "insensitive" } },
                              { category: { contains: search, mode: "insensitive" } },
                              { location: { contains: search, mode: "insensitive" } },
                          ],
                      },
                  }
                : {}),
            orderBy: { id: "asc" },
            skip,
            take,
        });
    }

    findById(id: number) {
        return prisma.item.findUnique({ where: { id } });
    }

    listByCategory(category: string, { skip, take }: { skip: number; take: number }) {
        return prisma.item.findMany({
            where: { category: { equals: category, mode: "insensitive" } },
            orderBy: { id: "asc" },
            skip,
            take,
        });
    }

    listByLocation(location: string, { skip, take }: { skip: number; take: number }) {
        return prisma.item.findMany({
            where: { location: { equals: location, mode: "insensitive" } },
            orderBy: { id: "asc" },
            skip,
            take,
        });
    }

    updateWithStockInvariant(
        id: number,
        data: ItemUpdateData,
        actorId: number,
    ): Promise<Item | null> {
        return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const rows = await tx.$queryRaw<Item[]>`
                SELECT * FROM "Item" WHERE "id" = ${id} FOR UPDATE
            `;
            const existing = rows[0];
            if (!existing) return null;

            if (
                existing.availableQuantity < 0 ||
                existing.totalQuantity < existing.availableQuantity
            ) {
                throw new InventoryInvariantError();
            }

            const borrowedQuantity = existing.totalQuantity - existing.availableQuantity;
            const totalQuantity = data.totalQuantity ?? existing.totalQuantity;
            if (totalQuantity < borrowedQuantity) {
                throw new InventoryCapacityError(borrowedQuantity);
            }

            const updated = await tx.item.update({
                where: { id },
                data: {
                    ...(data.name !== undefined ? { name: data.name } : {}),
                    ...(data.category !== undefined ? { category: data.category } : {}),
                    ...(data.location !== undefined ? { location: data.location } : {}),
                    ...(data.totalQuantity !== undefined
                        ? {
                              totalQuantity,
                              availableQuantity: totalQuantity - borrowedQuantity,
                          }
                        : {}),
                },
            });

            if (data.totalQuantity !== undefined && data.totalQuantity !== existing.totalQuantity) {
                await tx.inventoryAdjustment.create({
                    data: {
                        itemId: id,
                        actorId,
                        previousTotal: existing.totalQuantity,
                        newTotal: updated.totalQuantity,
                        previousAvailable: existing.availableQuantity,
                        newAvailable: updated.availableQuantity,
                        reason: data.adjustmentReason ?? "Ajuste de inventário",
                    },
                });
            }

            return updated;
        });
    }

    listAdjustments(itemId: number, { skip, take }: { skip: number; take: number }) {
        return prisma.inventoryAdjustment.findMany({
            where: { itemId },
            orderBy: { createdAt: "desc" },
            skip,
            take,
        });
    }

    async delete(id: number): Promise<void> {
        await prisma.item.delete({ where: { id }, select: { id: true } });
    }
}
