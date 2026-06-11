import type { Request, Response } from "express";
import { clientService } from "./client.service.js";
import type { CreateClientDTO, UpdateClientDTO } from "./client.dtos.js";

class ClientController {
    async create(req: Request, res: Response) {
        const data: CreateClientDTO = req.body;
        const client = await clientService.create(data);
        return res.status(200).json(client);
    }

    async list(req: Request, res: Response) {
        const clients = await clientService.list();
        return res.status(200).json(clients);
    }

    async getById(req: Request, res: Response) {
        const id = Number(req.params.id);
        const client = await clientService.getById(id);
        return res.status(200).json(client);
    }

    async updateById(req: Request, res: Response) {
        const id = Number(req.params.id);
        const data: UpdateClientDTO = req.body;
        const client = await clientService.updateById(id, data);
        return res.status(200).json(client);
    }

    async getLoanHistory(req: Request, res: Response) {
        const id = Number(req.params.id);
        const history = await clientService.getLoanHistory(id);
        return res.status(200).json(history);
    }

    async deleteById(req: Request, res: Response) {
        const id = Number(req.params.id);
        await clientService.deleteById(id);
        return res.status(200).send();
    }
}

const clientController = new ClientController();
export { clientController };
