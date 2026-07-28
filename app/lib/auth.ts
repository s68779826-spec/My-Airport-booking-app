import { PrismaClient, type User } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = globalThis.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

export type UserWithRole = User & {
  role: {
    id: number;
    name: string;
  };
};

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });
}

export async function findUserById(id: number) {
  return prisma.user.findUnique({
    where: { id },
    include: { role: true },
  });
}

export async function createUser(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  roleName?: string;
}) {
  const role = await prisma.role.upsert({
    where: { name: data.roleName ?? "USER" },
    update: {},
    create: { name: data.roleName ?? "USER" },
  });

  return prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      phone: data.phone,
      role: { connect: { id: role.id } },
    },
    include: { role: true },
  });
}

export function sanitizeUser(user: UserWithRole) {
  const { password: _password, ...sanitized } = user;
  void _password;
  return sanitized;
}
