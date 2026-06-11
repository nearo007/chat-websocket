import { prisma } from "@lib/prisma.js";
import type { CreateMovementDTO, MovementDTO } from "@modules/movement/movement.dtos.js";
import { MESSAGES } from "@src/constants/messages.js";

class MovementService {
    async create(data: CreateMovementDTO, loanId?: number): Promise<MovementDTO> {
        const item = await prisma.item.findUnique({ where: { id: data.itemId } });
        if (!item) {
            throw new Error(MESSAGES.MOVEMENT.VALIDATION.ITEM_NOT_FOUND);
        }

        const movement = await prisma.stockMovement.create({
            data: {
                type: data.type,
                quantity: data.quantity,
                itemId: data.itemId,
                reason: data.reason ?? null,
                loanId: loanId ?? null,
            },
        });

        return movement;
    }

    async list(): Promise<MovementDTO[]> {
        const movements = await prisma.stockMovement.findMany({
            orderBy: { createdAt: "desc" },
        });

        return movements;
    }

    async listByItemId(itemId: number): Promise<MovementDTO[]> {
        const movements = await prisma.stockMovement.findMany({
            where: { itemId },
            orderBy: { createdAt: "desc" },
        });

        return movements;
    }
}

const movementService = new MovementService();
export { movementService };
