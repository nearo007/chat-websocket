import { MESSAGES } from "@src/constants/messages.js";
import { AppError } from "@src/shared/errors/app.error.js";
import type { ClientDTO, CreateClientDTO, UpdateClientDTO } from "./client.dtos.js";
import { CreateClientValidator } from "./input-validation/create-client.validator.js";
import { UpdateClientValidator } from "./input-validation/update-client.validator.js";
import { type ClientRepository, PrismaClientRepository } from "./repositories/client.repository.js";

export class ClientService {
    constructor(
        private readonly clientRepository: ClientRepository = new PrismaClientRepository(),
    ) {}

    async create(data: CreateClientDTO): Promise<ClientDTO> {
        CreateClientValidator.validate(data);
        return this.clientRepository.create({
            name: data.name,
            email: data.email,
            ...(data.phone !== undefined ? { phone: data.phone } : {}),
        });
    }

    async list(options: { skip: number; take: number; search?: string }): Promise<ClientDTO[]> {
        return this.clientRepository.list(options);
    }

    async getById(id: number): Promise<ClientDTO> {
        const client = await this.clientRepository.findById(id);
        if (!client) throw new AppError(MESSAGES.CLIENT.NOT_FOUND.BY_ID, 404, "CLIENT_NOT_FOUND");
        return client;
    }

    async updateById(id: number, data: UpdateClientDTO): Promise<ClientDTO> {
        UpdateClientValidator.validate(data);
        return this.clientRepository.update(id, {
            ...(data.name !== undefined ? { name: data.name } : {}),
            ...(data.email !== undefined ? { email: data.email } : {}),
            ...(data.phone !== undefined ? { phone: data.phone } : {}),
        });
    }

    async getLoanHistory(id: number, pagination: { skip: number; take: number }) {
        const history = await this.clientRepository.getLoanHistory(id, pagination);
        if (!history) throw new AppError(MESSAGES.CLIENT.NOT_FOUND.BY_ID, 404, "CLIENT_NOT_FOUND");
        return history;
    }

    async deleteById(id: number): Promise<void> {
        await this.clientRepository.delete(id);
    }
}

const clientService = new ClientService();

export { clientService };
