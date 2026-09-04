export type ItemDTO = {
    id: number;
    name: string;
    category: string | null;
    totalQuantity: number;
    availableQuantity: number;
    location: string;
    createdAt: Date;
    updatedAt: Date;
};

export type CreateItemDTO = {
    name: string;
    category?: string | null;
    totalQuantity: number;
    location: string;
};

export type UpdateItemDTO = {
    name?: string;
    category?: string | null;
    totalQuantity?: number;
    location?: string;
    adjustmentReason?: string;
};

export type ListByCategoryDTO = {
    category: string;
};
export type ListByLocationDTO = {
    location: string;
};
