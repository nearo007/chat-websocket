import type { Request, Response } from "express";
import { itemService } from "@modules/item/item.service.js";
import type {
    CreateItemDTO,
    ListByCategoryDTO,
    ListByLocationDTO,
    UpdateItemDTO,
} from "@modules/item/item.dtos.js";


class ItemController {
    async create(req: Request, res: Response) {
        const data: CreateItemDTO = req.body;

        const item = await itemService.create(data);
        return res.status(200).json(item);
    }

    async list(req: Request, res: Response) {
        const items = await itemService.list();
        return res.status(200).json(items);
    }

    async getById(req: Request, res: Response) {
        const id = Number(req.params.id);
        const item = await itemService.getById(id);
        return res.status(200).json(item);
    }

    async listByCategory(req: Request, res: Response) {
        const category: ListByCategoryDTO = req.body;
        const items = await itemService.listByCategory(category);

        return res.status(200).json(items);
    }

    async listByLocation(req: Request, res: Response) {
        const location: ListByLocationDTO = req.body;
        const items = await itemService.listByLocation(location);

        return res.status(200).json(items);
    }

    async updateById(req: Request, res: Response) {
        const itemId = Number(req.params.id);
        const data: UpdateItemDTO = req.body;

        const item = await itemService.updateById(itemId, data);
        return res.status(200).json(item);
    }

    async getStockById(req: Request, res: Response) {
        const id = Number(req.params.id);
        const stock = await itemService.getStockById(id);
        return res.status(200).json(stock);
    }

    async deleteById(req: Request, res: Response) {
        const itemId = Number(req.params.id);
        const item = await itemService.deleteById(itemId);
        return res.status(200).json(item);
    }
}

const itemController = new ItemController();
export { itemController };
