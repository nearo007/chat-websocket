import { Router } from "express";
import { loanController } from "@modules/loan/loan.controller.js";
import { authMiddleware } from "@src/middlewares/authMiddleware.js";

const loanRouter = Router();

loanRouter.post("/", authMiddleware, loanController.create);
loanRouter.get("/", authMiddleware, loanController.list);
loanRouter.get("/:id", authMiddleware, loanController.getById);
loanRouter.patch("/:id", authMiddleware, loanController.updateById);
loanRouter.delete("/:id", authMiddleware, loanController.deleteById);

export { loanRouter };
