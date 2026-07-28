import Prisma from "@prisma/client";

const globalForPrisma = globalThis as {
  prisma?: Prisma.PrismaClient | undefined;
};

const prisma =
  globalForPrisma.prisma ??
  new Prisma.PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;