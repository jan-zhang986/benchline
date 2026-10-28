import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const BLOCKED_HOSTS = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata.google.internal",
  "metadata.internal",
]);

function ipv4FromMapped(ip: string): string | null {
  const lower = ip.toLowerCase();
  const tail = lower.slice(lower.lastIndexOf(":") + 1);
  return /^\d+\.\d+\.\d+\.\d+$/.test(tail) ? tail : null;
}

export function isPrivateIp(ip: string): boolean {
  const mapped = ip.includes(":") ? ipv4FromMapped(ip) : null;
  if (mapped) return isPrivateIp(mapped);
  if (ip.includes(":")) {
    const value = ip.toLowerCase();
    if (value === "::1" || value === "::") return true;
    if (value.startsWith("fc") || value.startsWith("fd") || value.startsWith("fe80")) return true;
    return false;
  }
  const parts = ip.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return true;
  }
  const [a, b] = parts;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a >= 224) return true;
  return false;
}

export type PublicUrl = { ok: true; url: URL } | { ok: false; error: string };

export async function assertPublicHttpUrl(input: string): Promise<PublicUrl> {
  let raw = input.trim();
  if (!raw) return { ok: false, error: "Enter a website URL." };
  if (raw.length > 300) return { ok: false, error: "That URL is too long." };
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(raw)) raw = `https://${raw}`;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false, error: "That website URL is not valid." };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, error: "Use an http or https URL." };
  }
  if (url.username || url.password) {
    return { ok: false, error: "URLs with a username or password are not allowed." };
  }
  if (url.port && url.port !== "80" && url.port !== "443") {
    return { ok: false, error: "Only ports 80 and 443 are allowed." };
  }

  const host = url.hostname.replace(/\.$/, "").toLowerCase();
  if (
    !host ||
    BLOCKED_HOSTS.has(host) ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host.endsWith(".localhost")
  ) {
    return { ok: false, error: "That host is not a public website." };
  }
  if (/^\d+$/.test(host) || /^0x[0-9a-f]+$/i.test(host)) {
    return { ok: false, error: "That host is not a public website." };
  }

  url.hash = "";

  if (isIP(host)) {
    if (isPrivateIp(host)) return { ok: false, error: "Private network addresses are blocked." };
    return { ok: true, url };
  }

  let records: { address: string }[];
  try {
    records = await lookup(host, { all: true, verbatim: true });
  } catch {
    return { ok: false, error: "Could not resolve that hostname." };
  }
  if (records.length === 0 || records.some((record) => isPrivateIp(record.address))) {
    return { ok: false, error: "That host does not resolve to a public address." };
  }
  return { ok: true, url };
}
