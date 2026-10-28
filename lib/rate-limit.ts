import { createHash } from "node:crypto";
import { execute } from "@/lib/db";

const HOURLY_LIMIT = 8;
const DAILY_LIMIT = 30;
const WAITLIST_HOURLY_LIMIT = 10;
const WAITLIST_DAILY_LIMIT = 20;

function hashIp(ip: string): string {
  const salt = process.env.RATE_LIMIT_SALT || "benchline-dev-salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export function clientIpFromHeaders(headerList: Headers): string {
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 80);
  }
  const realIp = headerList.get("x-real-ip")?.trim();
  if (realIp) return realIp.slice(0, 80);
  return "local";
}

async function bump(ipHash: string, bucket: string): Promise<number> {
  const result = await execute(
    `INSERT INTO rate_buckets (ip_hash, bucket, count) VALUES (?, ?, 1)
     ON CONFLICT(ip_hash, bucket) DO UPDATE SET count = count + 1
     RETURNING count`,
    [ipHash, bucket],
  );
  return Number(result.rows[0]?.count ?? 1);
}

export async function consumeRateLimit(
  ip: string,
  kind: "check" | "waitlist",
): Promise<{ ok: true } | { ok: false; error: string }> {
  const now = Date.now();
  const hour = Math.floor(now / 3_600_000);
  const day = Math.floor(now / 86_400_000);
  const prefix = kind === "check" ? "c" : "w";
  const ipHash = hashIp(ip);

  await execute(
    `DELETE FROM rate_buckets WHERE bucket LIKE ? AND CAST(substr(bucket, 4) AS INTEGER) < ?`,
    [`${prefix}h:%`, hour - 48],
  );
  await execute(
    `DELETE FROM rate_buckets WHERE bucket LIKE ? AND CAST(substr(bucket, 4) AS INTEGER) < ?`,
    [`${prefix}d:%`, day - 3],
  );

  const hourly = await bump(ipHash, `${prefix}h:${hour}`);
  const daily = await bump(ipHash, `${prefix}d:${day}`);
  const hourLimit = kind === "check" ? HOURLY_LIMIT : WAITLIST_HOURLY_LIMIT;
  const dayLimit = kind === "check" ? DAILY_LIMIT : WAITLIST_DAILY_LIMIT;

  if (hourly > hourLimit || daily > dayLimit) {
    return {
      ok: false,
      error:
        kind === "check"
          ? "This network has hit the free check limit (8 per hour, 30 per day). An existing report’s paste scorer does not count."
          : "Too many waitlist submissions from this network. Try again later.",
    };
  }
  return { ok: true };
}
