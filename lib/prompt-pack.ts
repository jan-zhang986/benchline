import type { PromptIntent, RenderedPrompt } from "@/lib/types";

/**
 * Horizontal prompt pack.
 * Edit this list to change the prompts a new report receives.
 * Saved reports keep the prompts rendered at check time.
 */
export const PROMPT_PACK: { id: string; intent: PromptIntent; template: string }[] = [
  { id: "best-tools", intent: "category", template: "best {category} tools 2026" },
  { id: "best-software", intent: "category", template: "best {category} software 2026" },
  { id: "top-platforms", intent: "category", template: "top {category} platforms" },
  { id: "comparison", intent: "category", template: "{category} tools comparison" },
  { id: "smb", intent: "category", template: "best {category} for small business" },
  { id: "should-use", intent: "category", template: "what {category} tool should I use" },
  { id: "alternatives-to", intent: "comparison", template: "alternatives to {brand}" },
  { id: "brand-alternatives", intent: "comparison", template: "{brand} alternatives" },
  { id: "vs", intent: "comparison", template: "{brand} vs competitors" },
  { id: "tools-like", intent: "comparison", template: "tools like {brand}" },
  { id: "what-is", intent: "brand", template: "what is {brand}" },
  { id: "how-works", intent: "brand", template: "how does {brand} work" },
  { id: "pricing", intent: "brand", template: "{brand} pricing" },
  { id: "worth-it", intent: "evaluation", template: "is {brand} worth it" },
  { id: "review", intent: "evaluation", template: "{brand} review" },
  { id: "pros-cons", intent: "evaluation", template: "{brand} pros and cons" },
  { id: "legit", intent: "evaluation", template: "is {brand} legit" },
  { id: "who-for", intent: "evaluation", template: "who should use {brand}" },
];

export const INTENT_LABEL: Record<PromptIntent, string> = {
  category: "Category demand",
  comparison: "Alternatives and comparisons",
  brand: "Brand understanding",
  evaluation: "Evaluation",
};

export const INTENT_ORDER: PromptIntent[] = [
  "category",
  "comparison",
  "brand",
  "evaluation",
];

export const DEFAULT_CATEGORY = "software";

export function renderPromptPack(brand: string, category: string | null): RenderedPrompt[] {
  const categoryUsed = category?.trim() || DEFAULT_CATEGORY;
  return PROMPT_PACK.map((item) => ({
    id: item.id,
    intent: item.intent,
    text: item.template
      .replaceAll("{brand}", brand.trim())
      .replaceAll("{category}", categoryUsed),
  }));
}
