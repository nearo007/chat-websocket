import { app } from "@src/app.js";
import { env } from "@src/config/env.js";
import { prisma } from "@src/lib/prisma.js";
import { logger } from "@src/shared/logger.js";

const server = app.listen(env.port, () => {
    logger.info({ port: env.port }, "Servidor iniciado");
});

let shuttingDown = false;

async function shutdown(signal: string) {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, "Encerrando servidor");

    const forceExit = setTimeout(() => {
        logger.error("Tempo limite de encerramento excedido");
        process.exit(1);
    }, 10_000);
    forceExit.unref();

    server.close(async (error) => {
        await prisma.$disconnect();
        clearTimeout(forceExit);

        if (error) {
            logger.error({ err: error }, "Falha ao encerrar servidor");
            process.exit(1);
        }

        logger.info("Servidor encerrado");
        process.exit(0);
    });
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
