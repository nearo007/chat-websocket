import bcrypt from "bcrypt";
import { prisma } from "./prisma.js";

type SeedUser = {
  username: string;
  email: string;
  password: string;
  role: "ADMIN" | "OPERATOR";
};

const users: SeedUser[] = [
  { username: "admin", email: "admin@fablab.pt", password: "admin123", role: "ADMIN" },
  { username: "user", email: "user@fablab.pt", password: "user123", role: "OPERATOR" },
];

export async function seed() {
  const hashedUsers = await Promise.all(
    users.map(async (u) => ({
      username: u.username,
      email: u.email,
      role: u.role,
      passwordHash: await bcrypt.hash(u.password, 10),
    })),
  );

  for (const user of hashedUsers) {
    await prisma.user.create({ data: user });
  }

  console.log(`  ${users.length} utilizadores criados`);
}
