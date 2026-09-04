import type { CreateUserDTO, UpdateUserDTO } from "@modules/user/user.dtos.js";
import { userService } from "@modules/user/user.service.js";
import { IdValidator } from "@src/shared/utils/validators/id.validator.js";
import { paginationFrom } from "@src/shared/validation/fields.js";
import type { Request, Response } from "express";
import { userListQuerySchema } from "./user.schemas.js";

class UserController {
    async create(req: Request, res: Response) {
        const data: CreateUserDTO = req.body;

        const user = await userService.create(data);
        return res.status(201).json(user);
    }

    async list(req: Request, res: Response) {
        const query = userListQuerySchema.parse(req.query);
        const users = await userService.list({
            ...paginationFrom(query),
            ...(query.search ? { search: query.search } : {}),
        });
        return res.status(200).json(users);
    }

    async getById(req: Request, res: Response) {
        const id = Number(req.params.id);
        IdValidator.validate(id);
        const user = await userService.getById(id);
        return res.status(200).json(user);
    }

    async updateById(req: Request, res: Response) {
        const userId = Number(req.params.id);
        IdValidator.validate(userId);
        const data: UpdateUserDTO = req.body;

        const user = await userService.updateById(userId, data);
        return res.status(200).json(user);
    }

    async deleteById(req: Request, res: Response) {
        const userId = Number(req.params.id);
        IdValidator.validate(userId);
        await userService.deleteById(userId);
        return res.status(204).send();
    }

    async updateOwnPassword(req: Request, res: Response) {
        await userService.updateOwnPassword(Number(req.userId), req.body);
        return res.status(204).send();
    }
}

const userController = new UserController();

export { userController };
