import type { Request, Response } from "express";
import { userService } from "@modules/user/user.service.js";
import type { CreateUserDTO, UpdateUserDTO } from "@modules/user/user.dtos.js";
import { IdValidator } from "@src/shared/utils/validators/id.validator.js";

class UserController {
    async create(req: Request, res: Response) {
        const data: CreateUserDTO = req.body;

        const user = await userService.create(data);
        return res.status(200).json(user);
    }

    async list(req: Request, res: Response) {
        const users = await userService.list();
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
        return res.status(200).send();
    }
}

const userController = new UserController();
export { userController };
