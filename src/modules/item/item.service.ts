import type {
    CreateItemDTO,
    ItemDTO,
    ListByCategoryDTO,
    ListByLocationDTO,
    UpdateItemDTO,
} from "@modules/item/item.dtos.js";
import { CreateItemValidator } from "@src/modules/item/input-validation/create-item.validator.js";
import {
    PrismaItemRepository,
    type ItemRepository,
} from "@src/modules/item/repositories/item.repository.js";

class ItemService {
    constructor(
        private readonly itemRepository: ItemRepository =
            new PrismaItemRepository(),
    ) {}

    async create(data: CreateItemDTO): Promise<ItemDTO> {
        const totalQuantity = data.totalQuantity ?? 0;
        const availableQuantity = data.availableQuantity ?? totalQuantity;
        const normalizedData = {
            ...data,
            totalQuantity,
            availableQuantity,
        };

        CreateItemValidator.validate(normalizedData);

        return this.itemRepository.create(normalizedData);
    }

    async list(): Promise<ItemDTO[]> {
        return this.itemRepository.list();
    }

    async getById(id: number): Promise<ItemDTO | null> {
        return this.itemRepository.findById(id);
    }

    async listByCategory({ category }: ListByCategoryDTO): Promise<ItemDTO[]> {
        return this.itemRepository.listByCategory(category);
    }

    async listByLocation({ location }: ListByLocationDTO): Promise<ItemDTO[]> {
        return this.itemRepository.listByLocation(location);
    }

    async updateById(id: number, data: UpdateItemDTO): Promise<ItemDTO> {
        const existing = await this.itemRepository.findById(id);
        if (!existing) {
            return this.itemRepository.update(id, data);
        }

        const validationData: CreateItemDTO = {
            name: data.name ?? existing.name,
            totalQuantity: data.totalQuantity ?? existing.totalQuantity,
            availableQuantity:
                data.availableQuantity ?? existing.availableQuantity,
            location: data.location ?? existing.location,
        };

        if (data.category !== undefined) {
            validationData.category = data.category;
        } else if (existing.category !== null) {
            validationData.category = existing.category;
        }

        CreateItemValidator.validate(validationData);

        return this.itemRepository.update(id, data);
    }

    async deleteById(id: number): Promise<void> {
        await this.itemRepository.delete(id);
    }
}

const itemService = new ItemService();
export { itemService };
