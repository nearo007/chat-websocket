import { Router } from "express";
import { itemController } from "@modules/item/item.controller.js";
import { authMiddleware } from "@src/middlewares/authMiddleware.js";
import { requireRole } from "@src/middlewares/roleMiddleware.js";

const itemRouter = Router();

itemRouter.post("/", authMiddleware, requireRole("ADMIN", "OPERATOR"), itemController.create);
itemRouter.get("/", authMiddleware, itemController.list);
itemRouter.get("/by-category", authMiddleware, itemController.listByCategory);
itemRouter.get("/by-location", authMiddleware, itemController.listByLocation);
itemRouter.get("/:id", authMiddleware, itemController.getById);
itemRouter.patch("/:id", authMiddleware, requireRole("ADMIN", "OPERATOR"), itemController.updateById);
itemRouter.delete("/:id", authMiddleware, requireRole("ADMIN"), itemController.deleteById);

export { itemRouter };
