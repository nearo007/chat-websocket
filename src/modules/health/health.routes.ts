import { prisma } from "@src/lib/prisma.js";
import { Router } from "express";

const healthRouter = Router();

healthRouter.get("/live", (_req, res) => {
    res.status(200).json({ status: "ok" });
});

healthRouter.get("/ready", async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: "ready" });
});

export { healthRouter };
