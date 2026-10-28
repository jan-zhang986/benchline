import { hostLabel } from "@/lib/brand";
import type { PasteCompetitor, PasteScore } from "@/lib/types";

const NAME_STOP = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "of",
  "to",
  "for",
  "in",
  "on",
  "with",
  "best",
  "top",
  "free",
  "how",
  "what",
  "why",
  "when",
  "where",
  "who",
  "is",
  "are",
  "it",
  "this",
  "that",
  "these",
  "those",
  "here",
  "there",
  "vs",
  "versus",
  "review",
  "reviews",
  "alternative",
  "alternatives",
  "tool",
  "tools",
  "software",
  "platform",
  "app",
  "inc",
  "llc",
  "ltd",
  "co",
  "company",
  "official",
  "website",
  "using",
  "use",
  "than",
  "also",
  "more",
  "most",
  "other",
  "others",
  "some",
  "such",
  "including",
  "include",
  "like",
  "just",
  "not",
  "but",
  "if",
  "can",
  "may",
  "will",
  "your",
  "our",
  "their",
  "from",
  "into",
  "about",
  "after",
  "before",
  "new",
  "ai",
]);

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function mentionRegex(term: string): RegExp | null {
  const parts = term.trim().split(/\s+/).filter(Boolean).map(escapeRegExp);
  if (parts.length === 0) return null;
  return new RegExp(`(?<![\\p{L}\\p{N}])${parts.join("\\s+")}(?![\\p{L}\\p{N}])`, "giu");
}

function countMentions(text: string, term: string): { count: number; firstIndex: number | null } {
  const regex = mentionRegex(term);
  if (!regex) return { count: 0, firstIndex: null };
  const matches = text.matchAll(regex);
  let count = 0;
  let firstIndex: number | null = null;
  for (const match of matches) {
    count += 1;
    if (firstIndex === null && match.index !== undefined) firstIndex = match.index;
  }
  return { count, firstIndex };
}

type ListItem = { raw: string; title: string };

function listItems(answer: string): ListItem[][] {
  const groups: ListItem[][] = [];
  let current: ListItem[] = [];
  const flush = () => {
    if (current.length >= 2) groups.push(current);
    current = [];
  };
  for (const line of answer.split(/\r?\n/)) {
    const match = line.match(/^\s*(?:[-*•]|\d{1,2}[.)])\s+(\S.*)$/);
    if (!match) {
      if (line.trim() === "") flush();
      else if (current.length) flush();
      continue;
    }
    const body = match[1].trim();
    const title = body.split(/\s+[—–|]\s+|:\s+/)[0]?.trim() ?? body;
    current.push({ raw: body, title });
  }
  flush();
  return groups;
}

function looksLikeName(title: string): boolean {
  const cleaned = title.replace(/[.。]+$/g, "").trim();
  if (cleaned.length < 2 || cleaned.length > 42) return false;
  if (/[.!?]/.test(cleaned)) return false;
  const words = cleaned.split(/\s+/);
  if (words.length > 4) return false;
  if (!/^[A-Z0-9]/.test(cleaned)) return false;
  if (words.every((word) => NAME_STOP.has(word.toLowerCase()))) return false;
  return true;
}

function sameName(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

function addCompetitor(
  list: PasteCompetitor[],
  name: string,
  evidence: string,
  brand: string,
) {
  const cleaned = name.replace(/^[\s"'“”]+|[\s"'“”,.;:]+$/g, "").trim();
  if (!looksLikeName(cleaned)) return;
  if (sameName(cleaned, brand)) return;
  if (list.some((item) => sameName(item.name, cleaned))) return;
  if (list.length >= 8) return;
  list.push({ name: cleaned, evidence });
}

function pullNameList(fragment: string, brand: string, evidence: string, into: PasteCompetitor[]) {
  for (const piece of fragment.split(/,|\band\b|\bor\b/i)) {
    addCompetitor(into, piece, evidence, brand);
  }
}

/**
 * Score a pasted answer. This never calls a model.
 * The number describes only the text the user supplied.
 */
export function scorePastedAnswer(input: {
  brand: string;
  answer: string;
  website?: string | null;
  competitors?: string[];
}): PasteScore {
  const brand = input.brand.trim();
  const answer = input.answer.replace(/\u0000/g, "").slice(0, 20_000);
  const notes: string[] = [];
  const competitors: PasteCompetitor[] = [];

  const brandHit = countMentions(answer, brand);
  const domain = hostLabel(input.website);
  const domainHit =
    domain && domain.toLowerCase() !== brand.toLowerCase()
      ? countMentions(answer, domain)
      : { count: 0, firstIndex: null };

  const useDomain = brandHit.count === 0 && domainHit.count > 0;
  const mentionCount = useDomain ? domainHit.count : brandHit.count;
  const firstIndex = useDomain ? domainHit.firstIndex : brandHit.firstIndex;
  const mentioned = mentionCount > 0 && firstIndex !== null;
  const matchedOn = mentioned ? (useDomain ? "domain" : "brand") : null;

  let positionPercent: number | null = null;
  let positionLabel: PasteScore["positionLabel"] = "not mentioned";
  if (mentioned && firstIndex !== null && answer.length > 0) {
    positionPercent = Math.round((firstIndex / answer.length) * 100);
    if (positionPercent < 25) positionLabel = "early";
    else if (positionPercent < 65) positionLabel = "middle";
    else positionLabel = "late";
  }

  const groups = listItems(answer);
  let listRank: number | null = null;
  let listSize: number | null = null;
  const needle = useDomain && domain ? domain : brand;
  for (const group of groups) {
    const index = group.findIndex((item) => countMentions(item.raw, needle).count > 0);
    if (index === -1) continue;
    listRank = index + 1;
    listSize = group.length;
    group.forEach((item, itemIndex) => {
      if (itemIndex === index) return;
      addCompetitor(competitors, item.title, "Another item in the same list.", brand);
    });
    break;
  }

  const vsPattern =
    /\b(?:vs\.?|versus|compared to|compared with)\s+([A-Z][\w.&'+-]*(?:\s+[A-Z][\w.&'+-]*){0,3})/g;
  for (const match of answer.matchAll(vsPattern)) {
    if (match[1]) addCompetitor(competitors, match[1], "Named in a versus or compared-to phrase.", brand);
  }

  const listPattern =
    /(?:such as|including|alternatives include|competitors include)\s+([^.!\n]+)/gi;
  for (const match of answer.matchAll(listPattern)) {
    if (match[1]) {
      pullNameList(match[1], brand, "Named in an alternatives or including phrase.", competitors);
    }
  }

  for (const supplied of input.competitors ?? []) {
    const name = supplied.trim();
    if (!name) continue;
    if (countMentions(answer, name).count > 0) {
      addCompetitor(competitors, name, "You listed this name, and it appears in the answer.", brand);
    }
  }

  let score = 0;
  if (!mentioned) {
    notes.push("The brand was not found as a whole word, so the paste score is 0.");
    if (domain) notes.push(`Also checked the domain label “${domain}”.`);
  } else {
    if (useDomain && domain) {
      notes.push(`Matched the domain label “${domain}”, not the full brand phrase.`);
    }
    if (positionLabel === "early") {
      score += 42;
      notes.push("The first mention is in the first quarter of the answer (+42).");
    } else if (positionLabel === "middle") {
      score += 26;
      notes.push("The first mention is in the middle of the answer (+26).");
    } else {
      score += 14;
      notes.push("The first mention is in the last part of the answer (+14).");
    }
    if (firstIndex !== null && firstIndex < 80) {
      score += 12;
      notes.push("The first mention starts near the top (+12).");
    }
    if (listRank === 1) {
      score += 28;
      notes.push("It is the first item in a list (+28).");
    } else if (listRank !== null && listRank <= 3) {
      score += 18;
      notes.push(`It is list item ${listRank} of ${listSize} (+18).`);
    } else if (listRank !== null) {
      score += 8;
      notes.push(`It is list item ${listRank} of ${listSize} (+8).`);
    }
    if (mentionCount >= 2) {
      score += 10;
      notes.push("It is named more than once (+10).");
    }
    const shortLine = answer.split(/\r?\n/).some((line) => {
      const trimmed = line.trim();
      return (
        trimmed.length > 0 &&
        trimmed.length <= brand.length + 24 &&
        countMentions(trimmed, needle).count > 0
      );
    });
    if (shortLine) {
      score += 8;
      notes.push("A short line is mostly this name (+8).");
    }
    score = Math.min(100, score);
  }

  notes.push(
    "This score only describes the pasted text. It is not a live rank in ChatGPT, Perplexity, Gemini, or Claude.",
  );

  return {
    mentioned,
    mentionCount,
    matchedOn,
    firstIndex,
    positionPercent,
    positionLabel,
    listRank,
    listSize,
    competitors,
    score,
    notes,
  };
}
