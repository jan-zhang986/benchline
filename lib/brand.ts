const GENERIC_TOKENS = new Set([
  "inc",
  "llc",
  "ltd",
  "co",
  "company",
  "corp",
  "corporation",
  "the",
  "app",
  "labs",
  "studio",
  "group",
  "hq",
  "io",
  "ai",
  "official",
]);

export function normalizePhrase(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Whole-phrase or distinctive-token match. Short brands must match as a whole word. */
export function brandMatches(brand: string, text: string): boolean {
  const phrase = normalizePhrase(brand);
  const haystack = ` ${normalizePhrase(text)} `;
  if (!phrase || haystack.trim() === "") return false;
  if (haystack.includes(` ${phrase} `)) return true;
  const tokens = phrase
    .split(" ")
    .filter((word) => word.length >= 4 && !GENERIC_TOKENS.has(word));
  return tokens.some((token) => haystack.includes(` ${token} `));
}

export function hostLabel(website: string | null | undefined): string | null {
  if (!website) return null;
  try {
    const host = new URL(website).hostname.replace(/^www\./i, "");
    const label = host.split(".")[0] ?? "";
    if (label.length < 3) return null;
    if (GENERIC_TOKENS.has(label.toLowerCase())) return null;
    return label;
  } catch {
    return null;
  }
}
