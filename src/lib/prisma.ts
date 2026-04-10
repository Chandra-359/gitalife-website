/**
 * Prisma client singleton (lazy initialization)
 *
 * Prisma v7 removed `url` from the datasource schema block.
 * At runtime, connections must be provided via:
 *   - `accelerateUrl` for Prisma Postgres / Accelerate (prisma+postgres:// URLs)
 *   - `adapter` with @prisma/adapter-pg for direct postgres:// connections
 *
 * The prisma.config.ts handles CLI operations (generate, migrate) separately.
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

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

  const accelerateUrl = urls.find(isAccelerateUrl);
  const directUrl = urls.find((u) => !isAccelerateUrl(u));

  let client: PrismaClient;
  if (accelerateUrl) {
    // Prisma Postgres / Accelerate proxy connection
    client = new PrismaClient({ accelerateUrl });
  } else if (directUrl) {
    // Direct postgres:// connection via driver adapter
    // Create pool with explicit SSL config to avoid pg v8 SSL mode warnings
    const pool = new pg.Pool({
      connectionString: directUrl,
      ssl: { rejectUnauthorized: false },
    });
    const adapter = new PrismaPg(pool);
    client = new PrismaClient({ adapter });
  } else {
    return null;
  }

  globalForPrisma.prisma = client;

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
