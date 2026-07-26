export const USER_ROLES = ["ADMIN", "OPERATOR"] as const;

export type UserRole = (typeof USER_ROLES)[number];
