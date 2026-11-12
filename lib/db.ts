import { PrismaClient } from "@prisma/client";

// Reuse one client across hot reloads in development.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

/** True when running against PostgreSQL (needed for case-insensitive search). */
export const isPostgres = /^postgres(ql)?:/i.test(process.env.DATABASE_URL ?? "");
