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
 * handle the fallback (e.g. return empty data).
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/** Collect all candidate database URLs from environment */
function getAllDatabaseUrls(): string[] {
  return [
    process.env.gitalife_PRISMA_DATABASE_URL,
    process.env.gitalife_DATABASE_URL,
    process.env.gitalife_POSTGRES_URL,
    process.env.DATABASE_URL,
  ].filter((u): u is string => !!u);
}

function isAccelerateUrl(url: string): boolean {
  return url.startsWith("prisma://") || url.startsWith("prisma+postgres://");
}

function getOrCreatePrismaClient(): PrismaClient | null {
  const urls = getAllDatabaseUrls();
  if (urls.length === 0) return null;

  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  // Prisma v7: use `accelerateUrl` for Prisma Postgres / Accelerate URLs,
  // otherwise fall back to setting DATABASE_URL for direct connections.
  const accelerateUrl = urls.find(isAccelerateUrl);

  let client: PrismaClient;
  if (accelerateUrl) {
    client = new PrismaClient({ accelerateUrl });
  } else {
    // Direct postgres:// connection — set DATABASE_URL so PrismaClient finds it
    process.env.DATABASE_URL = urls[0];
    client = new PrismaClient();
  }

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
