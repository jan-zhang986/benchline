import { load } from "cheerio";

function typeName(value: string): string {
  const trimmed = value.trim();
  const parts = trimmed.split(/[:/#]/).filter(Boolean);
  return parts[parts.length - 1] ?? trimmed;
}

function addType(set: Set<string>, value: unknown) {
  if (typeof value === "string") {
    const name = typeName(value);
    if (name) set.add(name);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) addType(set, item);
  }
}

function walk(node: unknown, set: Set<string>, depth = 0) {
  if (depth > 14 || node == null) return;
  if (Array.isArray(node)) {
    for (const item of node) walk(item, set, depth + 1);
    return;
  }
  if (typeof node !== "object") return;
  const record = node as Record<string, unknown>;
  if ("@type" in record) addType(set, record["@type"]);
  for (const value of Object.values(record)) {
    if (value && typeof value === "object") walk(value, set, depth + 1);
  }
}

export type PageSignals = {
  title: string;
  h1: string;
  description: string;
  canonical: string;
  schemaTypes: string[];
  htmlLang: string;
  ogTitle: string;
  ogDescription: string;
  twitterCard: string;
  /** Combined meta robots directives (lowercase, comma-separated tokens). */
  metaRobots: string;
};

function metaContent($: ReturnType<typeof load>, selectors: string[]): string {
  for (const selector of selectors) {
    const value = $(selector).attr("content");
    if (value?.trim()) return value.replace(/\s+/g, " ").trim();
  }
  return "";
}

export function parsePage(html: string): PageSignals {
  const $ = load(html);
  const title = $("title").first().text().replace(/\s+/g, " ").trim();
  const h1 = $("h1").first().text().replace(/\s+/g, " ").trim();
  const description = metaContent($, [
    'meta[name="description" i]',
    'meta[property="og:description" i]',
  ]);
  const canonical = ($('link[rel="canonical" i]').attr("href") || "").trim();
  const htmlLang = ($("html").attr("lang") || "").trim();
  const ogTitle = metaContent($, ['meta[property="og:title" i]']);
  const ogDescription = metaContent($, ['meta[property="og:description" i]']);
  const twitterCard = metaContent($, [
    'meta[name="twitter:card" i]',
    'meta[property="twitter:card" i]',
  ]);
  const metaRobots = metaContent($, [
    'meta[name="robots" i]',
    'meta[name="googlebot" i]',
  ]).toLowerCase();
  const schemaTypes = new Set<string>();

  $('script[type="application/ld+json" i]').each((_, element) => {
    const raw = $(element).text().trim();
    if (!raw) return;
    try {
      walk(JSON.parse(raw), schemaTypes);
    } catch {
      /* ignore invalid JSON-LD blocks */
    }
  });

  $("[itemtype]").each((_, element) => {
    const itemType = $(element).attr("itemtype");
    if (itemType) addType(schemaTypes, itemType);
  });

  return {
    title,
    h1,
    description,
    canonical,
    schemaTypes: [...schemaTypes],
    htmlLang,
    ogTitle,
    ogDescription,
    twitterCard,
    metaRobots,
  };
}

/** True when robots / X-Robots-Tag tokens include noindex (or none). */
export function hasNoindexDirective(...sources: string[]): boolean {
  for (const source of sources) {
    const tokens = source
      .toLowerCase()
      .split(/[,\s;]+/)
      .map((token) => token.trim())
      .filter(Boolean);
    if (tokens.includes("noindex") || tokens.includes("none")) return true;
  }
  return false;
}

export function looksLikeHtml(body: string, contentType: string): boolean {
  if (/text\/html|application\/xhtml\+xml/i.test(contentType)) return true;
  const head = body.trimStart().slice(0, 240).toLowerCase();
  return (
    head.startsWith("<!doctype html") ||
    head.startsWith("<html") ||
    head.startsWith("<head") ||
    head.startsWith("<body")
  );
}
