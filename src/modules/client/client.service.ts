import type {
    ClientDTO,
    CreateClientDTO,
    UpdateClientDTO,
} from "./client.dtos.js";
import { CreateClientValidator } from "./input-validation/create-client.validator.js";
import {
    PrismaClientRepository,
    type ClientRepository,
} from "./repositories/client.repository.js";

class ClientService {
    constructor(
        private readonly clientRepository: ClientRepository =
            new PrismaClientRepository(),
    ) {}

    async create(data: CreateClientDTO): Promise<ClientDTO> {
        CreateClientValidator.validate(data);
        return this.clientRepository.create(data);
    }

    async list(): Promise<ClientDTO[]> {
        return this.clientRepository.list();
    }

    async getById(id: number): Promise<ClientDTO | null> {
        return this.clientRepository.findById(id);
    }

    async updateById(id: number, data: UpdateClientDTO): Promise<ClientDTO> {
        return this.clientRepository.update(id, data);
    }

    async getLoanHistory(id: number) {
        return this.clientRepository.getLoanHistory(id);
    }

    async deleteById(id: number): Promise<void> {
        await this.clientRepository.delete(id);
    }
}

const clientService = new ClientService();
export { clientService };
