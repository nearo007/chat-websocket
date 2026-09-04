import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../src/config/env.js";
import { PrismaClient } from "../src/generated/prisma/client.js";

const adapter = new PrismaPg({
    connectionString: env.databaseUrl,
    connectionTimeoutMillis: env.databaseConnectionTimeoutMs,
});
const prisma = new PrismaClient({ adapter });

export { prisma };
