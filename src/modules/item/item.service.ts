import { prisma } from "@lib/prisma.js";
import type {
    CreateItemDTO,
    ItemDTO,
    ListByCategoryDTO,
    ListByLocationDTO,
    UpdateItemDTO,
} from "@modules/item/item.dtos.js";
import { CreateItemValidator } from "@src/modules/item/input-validation/create-item.validator.js";

class ItemService {
    async create(data: CreateItemDTO): Promise<ItemDTO> {
        CreateItemValidator.validate(data);

        const item = await prisma.item.create({
            data,
        });

        return item;
    }

    async list(): Promise<ItemDTO[]> {
        const items = await prisma.item.findMany();
        return items;
    }

    async getById(id: number): Promise<ItemDTO | null> {
        const item = await prisma.item.findUnique({ where: { id } });
        return item;
    }

    async listByCategory({ category }: ListByCategoryDTO): Promise<ItemDTO[]> {
        const items = await prisma.item.findMany({
            where: {
                category,
            },
        });

        return items;
    }

    async listByLocation({ location }: ListByLocationDTO): Promise<ItemDTO[]> {
        const items = await prisma.item.findMany({
            where: {
                location,
            },
        });

        return items;
    }

    async updateById(id: number, data: UpdateItemDTO): Promise<ItemDTO> {
        const item = await prisma.item.update({
            where: { id },
            data,
        });

        return item;
    }

    async deleteById(id: number): Promise<void> {
        await prisma.item.delete({
            where: { id },
        });

        return;
    }
}

const itemService = new ItemService();
export { itemService };

