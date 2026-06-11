import { Router } from "express";
import { movementController } from "@modules/movement/movement.controller.js";
import { authMiddleware } from "@src/middlewares/authMiddleware.js";

const movementRouter = Router();

movementRouter.post("/", authMiddleware, movementController.create);
movementRouter.get("/", authMiddleware, movementController.list);
movementRouter.get("/item/:itemId", authMiddleware, movementController.listByItemId);

export { movementRouter };
