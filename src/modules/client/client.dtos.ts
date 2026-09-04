export type ClientDTO = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    createdAt: Date;
    updatedAt: Date;
};

export type CreateClientDTO = {
    name: string;
    email: string;
    phone?: string | null;
};

export type UpdateClientDTO = {
    name?: string;
    email?: string;
    phone?: string | null;
};
