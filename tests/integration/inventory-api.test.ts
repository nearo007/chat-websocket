import { app } from "@src/app.js";
import { prisma } from "@src/lib/prisma.js";
import { Bcrypt } from "@src/shared/utils/bcrypt.js";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

const runDatabaseTests = process.env.RUN_DB_TESTS === "true";
const databaseSuite = runDatabaseTests ? describe : describe.skip;

databaseSuite("inventory API integration", () => {
    beforeAll(() => {
        const databaseName = new URL(process.env.DATABASE_URL ?? "").pathname.toLowerCase();
        if (!databaseName.includes("test")) {
            throw new Error("Os testes de integração exigem um banco cujo nome contenha 'test'.");
        }
    });

    beforeEach(async () => {
        await prisma.authToken.deleteMany();
        await prisma.loan.deleteMany();
        await prisma.inventoryAdjustment.deleteMany();
        await prisma.client.deleteMany();
        await prisma.item.deleteMany();
        await prisma.user.deleteMany();

        await prisma.user.create({
            data: {
                username: "admin",
                email: "admin@example.com",
                passwordHash: await Bcrypt.hashPassword("a-secure-test-password"),
                role: "ADMIN",
            },
        });
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    async function accessToken() {
        const response = await request(app).post("/auth/login").send({
            email: "admin@example.com",
            password: "a-secure-test-password",
        });
        expect(response.status).toBe(200);
        return response.body.accessToken as string;
    }

    it("requires an administrator to create users", async () => {
        const response = await request(app).post("/user").send({
            username: "operator",
            email: "operator@example.com",
            password: "a-secure-password",
            passwordConfirm: "a-secure-password",
        });

        expect(response.status).toBe(401);
        expect(response.body.error.code).toBe("TOKEN_MISSING");
    });

    it("does not remove the last administrator", async () => {
        const token = await accessToken();
        const admin = await prisma.user.findUniqueOrThrow({
            where: { email: "admin@example.com" },
        });
        const response = await request(app)
            .delete(`/user/${admin.id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(409);
        expect(response.body.error.code).toBe("LAST_ADMIN");
        await expect(prisma.user.findUnique({ where: { id: admin.id } })).resolves.not.toBeNull();
    });

    it("allows role management but does not demote the last administrator", async () => {
        const token = await accessToken();
        const admin = await prisma.user.findUniqueOrThrow({
            where: { email: "admin@example.com" },
        });

        const blocked = await request(app)
            .patch(`/user/${admin.id}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ role: "OPERATOR" });
        expect(blocked.status).toBe(409);
        expect(blocked.body.error.code).toBe("LAST_ADMIN");

        const created = await request(app)
            .post("/user")
            .set("Authorization", `Bearer ${token}`)
            .send({
                username: "second-admin",
                email: "second-admin@example.com",
                password: "a-secure-password",
                passwordConfirm: "a-secure-password",
                role: "ADMIN",
            });
        expect(created.status).toBe(201);
        expect(created.body.role).toBe("ADMIN");

        const demoted = await request(app)
            .patch(`/user/${admin.id}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ role: "OPERATOR" });
        expect(demoted.status).toBe(200);
        expect(demoted.body.role).toBe("OPERATOR");
    });

    it("revokes a refresh token on logout", async () => {
        const login = await request(app).post("/auth/login").send({
            email: "admin@example.com",
            password: "a-secure-test-password",
        });

        const logout = await request(app)
            .post("/auth/logout")
            .send({ refreshToken: login.body.refreshToken });
        expect(logout.status).toBe(204);

        const refresh = await request(app)
            .post("/auth/refresh")
            .send({ refreshToken: login.body.refreshToken });
        expect(refresh.status).toBe(401);
        expect(refresh.body.error.code).toBe("REFRESH_TOKEN_INVALID");
    });

    it("rejects malformed JSON with the standard error shape", async () => {
        const response = await request(app)
            .post("/auth/login")
            .set("Content-Type", "application/json")
            .send('{"email":');

        expect(response.status).toBe(400);
        expect(response.body.error).toEqual({ code: "INVALID_JSON", message: "JSON inválido." });
    });

    it("rejects nested Prisma relation input", async () => {
        const token = await accessToken();
        const response = await request(app)
            .post("/client")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Cliente",
                email: "client@example.com",
                loans: { create: {} },
            });

        expect(response.status).toBe(400);
        expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("keeps stock consistent across quantity reductions and concurrent returns", async () => {
        const token = await accessToken();
        const authorization = { Authorization: `Bearer ${token}` };

        const client = await request(app)
            .post("/client")
            .set(authorization)
            .send({ name: "Cliente", email: "client@example.com" });
        const item = await request(app)
            .post("/item")
            .set(authorization)
            .send({ name: "Arduino", totalQuantity: 10, location: "A1" });

        const loan = await request(app).post("/loan").set(authorization).send({
            clientId: client.body.id,
            itemId: item.body.id,
            loanDate: "2026-09-01T10:00:00Z",
            dueDate: "2026-09-20T10:00:00Z",
            loanQuantity: 5,
        });
        expect(loan.status).toBe(201);

        const resized = await request(app)
            .patch(`/item/${item.body.id}`)
            .set(authorization)
            .send({ totalQuantity: 6, adjustmentReason: "Item danificado" });
        expect(resized.status).toBe(200);
        expect(resized.body.availableQuantity).toBe(1);
        await expect(
            prisma.inventoryAdjustment.findFirst({ where: { itemId: item.body.id } }),
        ).resolves.toMatchObject({
            previousTotal: 10,
            newTotal: 6,
            previousAvailable: 5,
            newAvailable: 1,
            reason: "Item danificado",
        });

        const returnBody = { returnDate: "2026-09-04T10:00:00Z" };
        const returns = await Promise.all([
            request(app).patch(`/loan/${loan.body.id}`).set(authorization).send(returnBody),
            request(app).patch(`/loan/${loan.body.id}`).set(authorization).send(returnBody),
        ]);
        expect(returns.map((response) => response.status)).toEqual([200, 200]);

        const storedItem = await prisma.item.findUniqueOrThrow({ where: { id: item.body.id } });
        expect(storedItem.availableQuantity).toBe(6);
        expect(storedItem.availableQuantity).toBeLessThanOrEqual(storedItem.totalQuantity);

        const reopened = await request(app)
            .patch(`/loan/${loan.body.id}`)
            .set(authorization)
            .send({ loanDate: "2026-09-05T10:00:00Z", returnDate: null });
        expect(reopened.status).toBe(200);

        const reopenedItem = await prisma.item.findUniqueOrThrow({ where: { id: item.body.id } });
        expect(reopenedItem.availableQuantity).toBe(1);
    });

    it("cancels loans without deleting their audit history", async () => {
        const token = await accessToken();
        const authorization = { Authorization: `Bearer ${token}` };
        const client = await request(app)
            .post("/client")
            .set(authorization)
            .send({ name: "Cliente", email: "client@example.com" });
        const item = await request(app)
            .post("/item")
            .set(authorization)
            .send({ name: "Arduino", totalQuantity: 2, location: "A1" });
        const loan = await request(app).post("/loan").set(authorization).send({
            clientId: client.body.id,
            itemId: item.body.id,
            loanDate: "2026-09-01T10:00:00Z",
            dueDate: "2026-09-20T10:00:00Z",
            loanQuantity: 1,
        });

        const response = await request(app).delete(`/loan/${loan.body.id}`).set(authorization);
        expect(response.status).toBe(204);

        const storedLoan = await prisma.loan.findUniqueOrThrow({ where: { id: loan.body.id } });
        const storedItem = await prisma.item.findUniqueOrThrow({ where: { id: item.body.id } });
        expect(storedLoan.cancelledAt).not.toBeNull();
        expect(storedItem.availableQuantity).toBe(2);
    });
});
