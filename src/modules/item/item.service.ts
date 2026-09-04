import type {
    CreateItemDTO,
    ItemDTO,
    ListByCategoryDTO,
    ListByLocationDTO,
    UpdateItemDTO,
} from "@modules/item/item.dtos.js";
import { MESSAGES } from "@src/constants/messages.js";
import { CreateItemValidator } from "@src/modules/item/input-validation/create-item.validator.js";
import {
    type ItemRepository,
    PrismaItemRepository,
} from "@src/modules/item/repositories/item.repository.js";
import { AppError } from "@src/shared/errors/app.error.js";
import {
    InventoryCapacityError,
    InventoryInvariantError,
} from "@src/shared/errors/inventory-capacity.error.js";
import type { Pagination } from "@src/shared/validation/fields.js";

export class ItemService {
    constructor(private readonly itemRepository: ItemRepository = new PrismaItemRepository()) {}

    async create(data: CreateItemDTO): Promise<ItemDTO> {
        const totalQuantity = data.totalQuantity;
        const availableQuantity = totalQuantity;
        const normalizedData = {
            name: data.name,
            ...(data.category !== undefined ? { category: data.category } : {}),
            location: data.location,
            totalQuantity,
            availableQuantity,
        };

        CreateItemValidator.validate(normalizedData);

        return this.itemRepository.create(normalizedData);
    }

    async list(options: Pagination & { search?: string }): Promise<ItemDTO[]> {
        return this.itemRepository.list(options);
    }

    async getById(id: number): Promise<ItemDTO> {
        const item = await this.itemRepository.findById(id);
        if (!item) throw new AppError(MESSAGES.ITEM.NOT_FOUND.BY_ID, 404, "ITEM_NOT_FOUND");
        return item;
    }

    async listByCategory(
        { category }: ListByCategoryDTO,
        pagination: Pagination,
    ): Promise<ItemDTO[]> {
        return this.itemRepository.listByCategory(category, pagination);
    }

    async listByLocation(
        { location }: ListByLocationDTO,
        pagination: Pagination,
    ): Promise<ItemDTO[]> {
        return this.itemRepository.listByLocation(location, pagination);
    }

    async updateById(id: number, data: UpdateItemDTO, actorId: number): Promise<ItemDTO> {
        if (data.totalQuantity !== undefined && !data.adjustmentReason) {
            throw new AppError(
                "Informe o motivo da alteração de quantidade.",
                400,
                "ADJUSTMENT_REASON_REQUIRED",
            );
        }
        try {
            const item = await this.itemRepository.updateWithStockInvariant(id, data, actorId);
            if (!item) throw new AppError(MESSAGES.ITEM.NOT_FOUND.BY_ID, 404, "ITEM_NOT_FOUND");
            return item;
        } catch (error) {
            if (error instanceof InventoryCapacityError) {
                throw new AppError(
                    `A quantidade total não pode ser menor que as ${error.borrowedQuantity} unidades emprestadas.`,
                    409,
                    "ITEM_HAS_BORROWED_UNITS",
                );
            }
            if (error instanceof InventoryInvariantError) {
                throw new AppError(
                    "O estoque está inconsistente e precisa de reconciliação.",
                    409,
                    "INVENTORY_INCONSISTENT",
                );
            }
            throw error;
        }
    }

    async listAdjustments(id: number, pagination: Pagination) {
        await this.getById(id);
        return this.itemRepository.listAdjustments(id, pagination);
    }

    async deleteById(id: number): Promise<void> {
        await this.itemRepository.delete(id);
    }
}

const itemService = new ItemService();

export { itemService };
