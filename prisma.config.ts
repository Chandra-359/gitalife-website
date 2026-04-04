import { resolve } from "path";
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env.local first (Next.js convention), then .env as fallback
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const databaseUrl =
  process.env["gitalife_PRISMA_DATABASE_URL"] ??
  process.env["gitalife_DATABASE_URL"] ??
  process.env["gitalife_POSTGRES_URL"] ??
  process.env["DATABASE_URL"];

if (!databaseUrl) {
  console.error(
    "\n❌ No database URL found.\n" +
    "   Create a .env.local file with:\n\n" +
    '   gitalife_PRISMA_DATABASE_URL="postgres://..."\n'
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl!,
  },
});
