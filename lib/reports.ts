import { randomBytes } from "node:crypto";
import { execute } from "@/lib/db";
import type { Fix, Finding, LiveCheck, RenderedPrompt, ReportRecord } from "@/lib/types";

const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

function newId(): string {
  const bytes = randomBytes(10);
  let id = "";
  for (const byte of bytes) id += ALPHABET[byte % ALPHABET.length];
  return id;
}

function asRecord(row: unknown): Record<string, unknown> | null {
  if (!row || typeof row !== "object") return null;
  return row as Record<string, unknown>;
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string") return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function toReport(row: Record<string, unknown>): ReportRecord {
  return {
    id: String(row.id ?? ""),
    brand: String(row.brand ?? ""),
    website: String(row.website ?? ""),
    finalUrl: row.final_url == null ? null : String(row.final_url),
    category: row.category == null ? null : String(row.category),
    categoryUsed: String(row.category_used ?? "software"),
    categoryDefaulted: Number(row.category_defaulted) === 1,
    score: Number(row.score ?? 0),
    findings: parseJson<Finding[]>(row.findings_json, []),
    prompts: parseJson<RenderedPrompt[]>(row.prompts_json, []),
    fixes: parseJson<Fix[]>(row.fixes_json, []),
    live: parseJson<LiveCheck[]>(row.live_json, []),
    createdAt: String(row.created_at ?? ""),
  };
}

export async function saveReport(
  report: Omit<ReportRecord, "id" | "createdAt">,
): Promise<string> {
  const createdAt = new Date().toISOString();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const id = newId();
    try {
      await execute(
        `INSERT INTO reports (
          id, brand, website, final_url, category, category_used, category_defaulted,
          score, findings_json, prompts_json, fixes_json, live_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          report.brand,
          report.website,
          report.finalUrl,
          report.category,
          report.categoryUsed,
          report.categoryDefaulted ? 1 : 0,
          report.score,
          JSON.stringify(report.findings),
          JSON.stringify(report.prompts),
          JSON.stringify(report.fixes),
          JSON.stringify(report.live),
          createdAt,
        ],
      );
      return id;
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (!/unique/i.test(message)) throw error;
    }
  }
  throw new Error("Could not allocate a report id.");
}

export async function getReport(id: string): Promise<ReportRecord | null> {
  if (!/^[a-z0-9]{8,16}$/.test(id)) return null;
  const result = await execute(`SELECT * FROM reports WHERE id = ?`, [id]);
  const row = asRecord(result.rows[0]);
  return row ? toReport(row) : null;
}

export async function listReportPaths(limit = 500): Promise<{ id: string; createdAt: string }[]> {
  const result = await execute(
    `SELECT id, created_at FROM reports ORDER BY created_at DESC LIMIT ?`,
    [limit],
  );
  return result.rows.flatMap((row) => {
    const record = asRecord(row);
    if (!record) return [];
    return [{ id: String(record.id), createdAt: String(record.created_at) }];
  });
}

export async function saveWaitlist(input: {
  email: string;
  brand: string | null;
  source: string;
}): Promise<void> {
  await execute(
    `INSERT INTO waitlist (email, brand, source, created_at) VALUES (?, ?, ?, ?)
     ON CONFLICT(email) DO NOTHING`,
    [input.email, input.brand, input.source, new Date().toISOString()],
  );
}
