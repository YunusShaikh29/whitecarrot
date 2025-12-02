import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

const db = globalForPrisma.prisma ?? new PrismaClient({} as any)

if(process.env.NODE_ENV !== "production") globalForPrisma.prisma = db

export default db;