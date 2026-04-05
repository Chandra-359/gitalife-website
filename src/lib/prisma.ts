/**
 * Prisma client singleton (lazy initialization)
 *
 * In development, Next.js hot-reloads and re-imports modules frequently.
 * Without this singleton pattern, each reload would create a new PrismaClient,
 * eventually exhausting the database connection pool.
 *
 * The client is created lazily (on first access) to avoid connection errors
 * during Vercel's build phase when the database may not be reachable.
 *
 * If no database URL is set, `prisma` will be null and callers should
 * handle the fallback (e.g. serve hardcoded data).
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl(): string | undefined {
  return process.env.gitalife_PRISMA_DATABASE_URL
    ?? process.env.gitalife_DATABASE_URL
    ?? process.env.gitalife_POSTGRES_URL
    ?? process.env.DATABASE_URL;
}

function getOrCreatePrismaClient(): PrismaClient | null {
  const url = getDatabaseUrl();
  if (!url) return null;

  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  // Prisma v7 removed `url` from the schema — connection URLs for the
  // runtime client must be passed via the constructor. Prisma Postgres
  // uses the Accelerate protocol, so we use `accelerateUrl`.
  const client = new PrismaClient({ accelerateUrl: url });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }

  return client;
}

/** Lazy proxy — the PrismaClient is only instantiated on first property access at runtime */
export const prisma: PrismaClient | null = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getOrCreatePrismaClient();
    if (!client) return undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (client as any)[prop];
  },
});
