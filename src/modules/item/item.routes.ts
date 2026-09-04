import { itemController } from "@modules/item/item.controller.js";
import { authMiddleware } from "@src/middlewares/authMiddleware.js";
import { requireRole } from "@src/middlewares/roleMiddleware.js";
import { validateBody } from "@src/middlewares/validateMiddleware.js";
import { Router } from "express";
import { createItemSchema, updateItemSchema } from "./item.schemas.js";

const itemRouter = Router();

itemRouter.post(
    "/",
    authMiddleware,
    requireRole("ADMIN", "OPERATOR"),
    validateBody(createItemSchema),
    itemController.create,
);
itemRouter.get("/", authMiddleware, itemController.list);
itemRouter.get("/by-category", authMiddleware, itemController.listByCategory);
itemRouter.get("/by-location", authMiddleware, itemController.listByLocation);
itemRouter.get(
    "/:id/adjustments",
    authMiddleware,
    requireRole("ADMIN"),
    itemController.listAdjustments,
);
itemRouter.get("/:id", authMiddleware, itemController.getById);
itemRouter.patch(
    "/:id",
    authMiddleware,
    requireRole("ADMIN", "OPERATOR"),
    validateBody(updateItemSchema),
    itemController.updateById,
);
itemRouter.delete("/:id", authMiddleware, requireRole("ADMIN"), itemController.deleteById);

export { itemRouter };
