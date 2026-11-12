// Runs the Prisma CLI against the right schema for the current DATABASE_URL.
//
//   file:...      -> prisma/schema.prisma           (SQLite, local development)
//   postgres(ql): -> prisma/postgres/schema.prisma  (PostgreSQL, production)
//
// Prisma cannot switch provider from an env var, so we keep two schemas that
// are identical apart from the datasource and choose between them here.
import { spawnSync } from "node:child_process";
import { join } from "node:path";

try {
  process.loadEnvFile(".env");
} catch {
  // No .env file: fall back to the process environment / defaults below.
}

const url = process.env.DATABASE_URL ?? "file:./dev.db";
const isPostgres = /^postgres(ql)?:/i.test(url);
const schema = isPostgres ? "prisma/postgres/schema.prisma" : "prisma/schema.prisma";

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node scripts/prisma.mjs <prisma command> [...args]");
  process.exit(1);
}

// `prisma db seed` does not accept --schema; every other command does.
const isSeed = args[0] === "db" && args[1] === "seed";
const cliArgs = isSeed ? args : [...args, "--schema", schema];

if (args[0] !== "generate") {
  console.log(`[prisma] ${isPostgres ? "PostgreSQL" : "SQLite"} -> ${schema}`);
}

const cli = join(process.cwd(), "node_modules", "prisma", "build", "index.js");
const result = spawnSync(process.execPath, [cli, ...cliArgs], {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: url },
});

process.exit(result.status ?? 1);
