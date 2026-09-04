import { authMiddleware } from "@src/middlewares/authMiddleware.js";
import { requireRole } from "@src/middlewares/roleMiddleware.js";
import { validateBody } from "@src/middlewares/validateMiddleware.js";
import { Router } from "express";
import { clientController } from "./client.controller.js";
import { createClientSchema, updateClientSchema } from "./client.schemas.js";

const clientRouter = Router();

clientRouter.post(
    "/",
    authMiddleware,
    requireRole("ADMIN", "OPERATOR"),
    validateBody(createClientSchema),
    clientController.create,
);
clientRouter.get("/", authMiddleware, clientController.list);
clientRouter.get("/:id/loans", authMiddleware, clientController.getLoanHistory);
clientRouter.get("/:id", authMiddleware, clientController.getById);
clientRouter.patch(
    "/:id",
    authMiddleware,
    requireRole("ADMIN", "OPERATOR"),
    validateBody(updateClientSchema),
    clientController.updateById,
);
clientRouter.delete("/:id", authMiddleware, requireRole("ADMIN"), clientController.deleteById);

export { clientRouter };
