import type { Request, Response } from "express";
import { movementService } from "@modules/movement/movement.service.js";
import type { CreateMovementDTO } from "@modules/movement/movement.dtos.js";

class MovementController {
    async create(req: Request, res: Response) {
        const data: CreateMovementDTO = req.body;

        const movement = await movementService.create(data);
        return res.status(201).json(movement);
    }

    async list(req: Request, res: Response) {
        const movements = await movementService.list();
        return res.status(200).json(movements);
    }

    async listByItemId(req: Request, res: Response) {
        const itemId = Number(req.params.itemId);
        const movements = await movementService.listByItemId(itemId);
        return res.status(200).json(movements);
    }
}

const movementController = new MovementController();
export { movementController };
