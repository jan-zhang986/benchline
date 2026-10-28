import fs from "node:fs";
import path from "node:path";
import { createClient, type Client, type ResultSet } from "@libsql/client";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  brand TEXT NOT NULL,
  website TEXT NOT NULL,
  final_url TEXT,
  category TEXT,
  category_used TEXT NOT NULL,
  category_defaulted INTEGER NOT NULL,
  score INTEGER NOT NULL,
  findings_json TEXT NOT NULL,
  prompts_json TEXT NOT NULL,
  fixes_json TEXT NOT NULL,
  live_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS reports_created_at ON reports (created_at DESC);

CREATE TABLE IF NOT EXISTS waitlist (
  email TEXT PRIMARY KEY,
  brand TEXT,
  source TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS rate_buckets (
  ip_hash TEXT NOT NULL,
  bucket TEXT NOT NULL,
  count INTEGER NOT NULL,
  PRIMARY KEY (ip_hash, bucket)
);

CREATE TABLE IF NOT EXISTS live_cache (
  cache_key TEXT PRIMARY KEY,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS live_quota (
  day TEXT PRIMARY KEY,
  count INTEGER NOT NULL
);
`;

const globalForDb = globalThis as unknown as { benchline?: Client; benchlineReady?: Promise<void> };

function databaseUrl(): string {
  if (process.env.TURSO_DATABASE_URL) return process.env.TURSO_DATABASE_URL;
  if (process.env.VERCEL) return "file:/tmp/benchline.db";
  return `file:${path.resolve(process.cwd(), "data", "benchline.db")}`;
}

export function getDb(): Client {
  if (!globalForDb.benchline) {
    const url = databaseUrl();
    if (url.startsWith("file:")) {
      const filePath = url.slice("file:".length);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }
    globalForDb.benchline = createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return globalForDb.benchline;
}

export function ensureDb(): Promise<void> {
  if (!globalForDb.benchlineReady) {
    globalForDb.benchlineReady = getDb()
      .executeMultiple(SCHEMA)
      .then(() => undefined)
      .catch((error: unknown) => {
        globalForDb.benchlineReady = undefined;
        throw error;
      });
  }
  return globalForDb.benchlineReady;
}

export async function execute(sql: string, args: Array<string | number | null> = []): Promise<ResultSet> {
  await ensureDb();
  return getDb().execute({ sql, args });
}
