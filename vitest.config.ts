import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
    resolve: {
        alias: {
            "@src": `${root}src`,
            "@shared": `${root}src/shared`,
            "@lib": `${root}src/lib`,
            "@middlewares": `${root}src/middlewares`,
            "@modules": `${root}src/modules`,
        },
    },
    test: {
        setupFiles: ["./tests/setup.ts"],
        sequence: { concurrent: false },
        coverage: { reporter: ["text", "html"] },
    },
});
