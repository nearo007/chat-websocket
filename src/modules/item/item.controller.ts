import type {
    CreateItemDTO,
    ListByCategoryDTO,
    ListByLocationDTO,
    UpdateItemDTO,
} from "@modules/item/item.dtos.js";
import { itemService } from "@modules/item/item.service.js";
import { IdValidator } from "@src/shared/utils/validators/id.validator.js";
import { paginationFrom, paginationQuerySchema } from "@src/shared/validation/fields.js";
import type { Request, Response } from "express";
import { categoryQuerySchema, itemListQuerySchema, locationQuerySchema } from "./item.schemas.js";

class ItemController {
    async create(req: Request, res: Response) {
        const data: CreateItemDTO = req.body;

        const item = await itemService.create(data);
        return res.status(201).json(item);
    }

    async list(req: Request, res: Response) {
        const query = itemListQuerySchema.parse(req.query);
        const items = await itemService.list({
            ...paginationFrom(query),
            ...(query.search ? { search: query.search } : {}),
        });
        return res.status(200).json(items);
    }

    async getById(req: Request, res: Response) {
        const id = Number(req.params.id);
        IdValidator.validate(id);
        const item = await itemService.getById(id);
        return res.status(200).json(item);
    }

    async listByCategory(req: Request, res: Response) {
        const query = categoryQuerySchema.parse(req.query);
        const category: ListByCategoryDTO = { category: query.category };
        const items = await itemService.listByCategory(category, paginationFrom(query));

        return res.status(200).json(items);
    }

    async listByLocation(req: Request, res: Response) {
        const query = locationQuerySchema.parse(req.query);
        const location: ListByLocationDTO = { location: query.location };
        const items = await itemService.listByLocation(location, paginationFrom(query));

        return res.status(200).json(items);
    }

    async updateById(req: Request, res: Response) {
        const itemId = Number(req.params.id);
        IdValidator.validate(itemId);
        const data: UpdateItemDTO = req.body;

        const item = await itemService.updateById(itemId, data, Number(req.userId));
        return res.status(200).json(item);
    }

    async listAdjustments(req: Request, res: Response) {
        const itemId = Number(req.params.id);
        IdValidator.validate(itemId);
        const query = paginationQuerySchema.parse(req.query);
        const adjustments = await itemService.listAdjustments(itemId, paginationFrom(query));
        return res.status(200).json(adjustments);
    }

    async deleteById(req: Request, res: Response) {
        const itemId = Number(req.params.id);
        IdValidator.validate(itemId);
        await itemService.deleteById(itemId);
        return res.status(204).send();
    }
}

const itemController = new ItemController();

export { itemController };
