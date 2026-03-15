/**
 * Prisma client singleton
 *
 * In development, Next.js hot-reloads and re-imports modules frequently.
 * Without this singleton pattern, each reload would create a new PrismaClient,
 * eventually exhausting the database connection pool.
 *
 * If DATABASE_URL is not set, `prisma` will be null and callers should
 * handle the fallback (e.g. serve hardcoded data).
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient | null {
  if (!process.env.DATABASE_URL) return null;
  return new PrismaClient();
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production" && prisma) {
  globalForPrisma.prisma = prisma;
}
