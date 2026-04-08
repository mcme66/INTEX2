import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Repo root (parent of frontend/). */
const repoRoot = join(__dirname, "../..");

function parseDotEnvContent(text) {
  /** @type {Record<string, string>} */
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

/**
 * Npgsql / .NET style: Host=...;Port=...;Database=...;Username=...;Password=...
 * node-postgres does not parse this format as a URL (it wrongly resolves against postgres://base).
 */
function dotnetConnectionStringToPoolConfig(cs) {
  /** @type {Record<string, string>} */
  const map = {};
  for (const part of cs.split(";")) {
    const t = part.trim();
    if (!t) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    map[t.slice(0, eq).trim().toLowerCase()] = t.slice(eq + 1).trim();
  }

  const host = map.host || map.server || "localhost";
  const port = parseInt(map.port || "5432", 10);
  const database = map.database;
  const user = map.username || map["user id"] || map.userid || map.user;
  const password = map.password ?? "";

  if (!database || !user) {
    throw new Error(
      "Connection string must include Database and Username (or User Id). Got: " +
        [...Object.keys(map)].join(", "),
    );
  }

  return { host, port, database, user, password };
}

function isPostgresUri(s) {
  return /^postgres(ql)?:\/\//i.test(s.trim());
}

/**
 * Resolves connection info from DATABASE_URL (env or .env files), ConnectionStrings__Default, or appsettings.
 */
export function getRawConnectionString() {
  if (process.env.DATABASE_URL?.trim()) return process.env.DATABASE_URL.trim();

  const envPaths = [join(repoRoot, ".env"), join(repoRoot, "frontend/.env")];
  for (const p of envPaths) {
    if (!existsSync(p)) continue;
    const env = parseDotEnvContent(readFileSync(p, "utf8"));
    if (env.DATABASE_URL?.trim()) return env.DATABASE_URL.trim();
    if (env.ConnectionStrings__Default?.trim()) return env.ConnectionStrings__Default.trim();
  }

  const appsettings = join(repoRoot, "backend/IntexApi/appsettings.Development.json");
  if (existsSync(appsettings)) {
    const j = JSON.parse(readFileSync(appsettings, "utf8"));
    const cs = j.ConnectionStrings?.Default;
    if (cs) return cs;
  }

  throw new Error(
    "No database connection string found. Set DATABASE_URL or ConnectionStrings__Default in repo or frontend .env, or backend/IntexApi/appsettings.Development.json.",
  );
}

export function createPool() {
  const raw = getRawConnectionString();

  if (isPostgresUri(raw)) {
    return new pg.Pool({ connectionString: raw });
  }

  if (raw.includes("=") && raw.includes(";")) {
    return new pg.Pool(dotnetConnectionStringToPoolConfig(raw));
  }

  return new pg.Pool({ connectionString: raw });
}

export const csvRoot = join(repoRoot, "lighthouse_csv_v7");
