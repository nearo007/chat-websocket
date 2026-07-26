import { Router } from "express";
import { loanController } from "@modules/loan/loan.controller.js";
import { authMiddleware } from "@src/middlewares/authMiddleware.js";
import { requireRole } from "@src/middlewares/roleMiddleware.js";

const loanRouter = Router();

loanRouter.post("/", authMiddleware, requireRole("ADMIN", "OPERATOR"), loanController.create);
loanRouter.get("/", authMiddleware, loanController.list);
loanRouter.get("/:id", authMiddleware, loanController.getById);
loanRouter.patch("/:id", authMiddleware, requireRole("ADMIN", "OPERATOR"), loanController.updateById);
loanRouter.delete("/:id", authMiddleware, requireRole("ADMIN"), loanController.deleteById);

export { loanRouter };
