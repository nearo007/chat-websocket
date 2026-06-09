import { prisma } from "@lib/prisma.js";
import type {
    ClientDTO,
    CreateClientDTO,
    UpdateClientDTO,
} from "./client.dtos.js";
import { CreateClientValidator } from "./input-validation/create-client.validator.js";

class ClientService {
    async create(data: CreateClientDTO): Promise<ClientDTO> {
        CreateClientValidator.validate(data);
        const client = await prisma.client.create({ data });
        return client;
    }

    async list(): Promise<ClientDTO[]> {
        const clients = await prisma.client.findMany();
        return clients;
    }

    async getById(id: number): Promise<ClientDTO | null> {
        const client = await prisma.client.findUnique({ where: { id } });
        return client;
    }

    async updateById(id: number, data: UpdateClientDTO): Promise<ClientDTO> {
        const client = await prisma.client.update({ where: { id }, data });
        return client;
    }

    async getLoanHistory(id: number) {
        const client = await prisma.client.findUnique({
            where: { id },
            include: {
                loans: {
                    include: { item: true },
                    orderBy: { loanDate: "desc" },
                },
            },
        });
        return client;
    }

    async deleteById(id: number): Promise<void> {
        await prisma.client.delete({ where: { id } });
        return;
    }
}

const clientService = new ClientService();
export { clientService };
