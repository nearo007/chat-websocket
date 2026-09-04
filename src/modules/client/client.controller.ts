import { IdValidator } from "@src/shared/utils/validators/id.validator.js";
import { paginationFrom, paginationQuerySchema } from "@src/shared/validation/fields.js";
import type { Request, Response } from "express";
import type { CreateClientDTO, UpdateClientDTO } from "./client.dtos.js";
import { clientListQuerySchema } from "./client.schemas.js";
import { clientService } from "./client.service.js";

class ClientController {
    async create(req: Request, res: Response) {
        const data: CreateClientDTO = req.body;
        const client = await clientService.create(data);
        return res.status(201).json(client);
    }

    async list(req: Request, res: Response) {
        const query = clientListQuerySchema.parse(req.query);
        const clients = await clientService.list({
            ...paginationFrom(query),
            ...(query.search ? { search: query.search } : {}),
        });
        return res.status(200).json(clients);
    }

    async getById(req: Request, res: Response) {
        const id = Number(req.params.id);
        IdValidator.validate(id);
        const client = await clientService.getById(id);
        return res.status(200).json(client);
    }

    async updateById(req: Request, res: Response) {
        const id = Number(req.params.id);
        IdValidator.validate(id);
        const data: UpdateClientDTO = req.body;
        const client = await clientService.updateById(id, data);
        return res.status(200).json(client);
    }

    async getLoanHistory(req: Request, res: Response) {
        const id = Number(req.params.id);
        IdValidator.validate(id);
        const query = paginationQuerySchema.parse(req.query);
        const history = await clientService.getLoanHistory(id, paginationFrom(query));
        return res.status(200).json(history);
    }

    async deleteById(req: Request, res: Response) {
        const id = Number(req.params.id);
        IdValidator.validate(id);
        await clientService.deleteById(id);
        return res.status(204).send();
    }
}

const clientController = new ClientController();

export { clientController };
