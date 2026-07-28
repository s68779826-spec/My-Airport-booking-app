import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

console.log("Keys:", Object.keys(prisma));
console.log("role:", (prisma as any).role);
console.log("user:", (prisma as any).user);