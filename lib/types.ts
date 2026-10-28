export type FindingStatus = "pass" | "fail" | "unknown";

export type FindingGroup = "crawlers" | "llms" | "schema" | "onpage";

export type Finding = {
  id: string;
  group: FindingGroup;
  label: string;
  status: FindingStatus;
  points: number;
  maxPoints: number;
  detail: string;
  fix: string | null;
};

export type Fix = {
  id: string;
  title: string;
  detail: string;
  points: number;
};

export type PromptIntent = "category" | "brand" | "comparison" | "evaluation";

export type RenderedPrompt = {
  id: string;
  intent: PromptIntent;
  text: string;
};

export type LiveProvider = "dataforseo" | "openai" | "brave";

export type LiveStatus = "skipped" | "ok" | "error" | "quota";

export type LiveCheck = {
  status: LiveStatus;
  provider: LiveProvider | null;
  providerLabel: string;
  prompt: string | null;
  answer: string | null;
  mentioned: boolean | null;
  mentionScore: number | null;
  detail: string;
  cached: boolean;
  disclaimer: string;
};

export type ReportRecord = {
  id: string;
  brand: string;
  website: string;
  finalUrl: string | null;
  category: string | null;
  categoryUsed: string;
  categoryDefaulted: boolean;
  score: number;
  findings: Finding[];
  prompts: RenderedPrompt[];
  fixes: Fix[];
  live: LiveCheck[];
  createdAt: string;
};

export type PasteCompetitor = {
  name: string;
  evidence: string;
};

export type PasteScore = {
  mentioned: boolean;
  mentionCount: number;
  matchedOn: "brand" | "domain" | null;
  firstIndex: number | null;
  positionPercent: number | null;
  positionLabel: "not mentioned" | "early" | "middle" | "late";
  listRank: number | null;
  listSize: number | null;
  competitors: PasteCompetitor[];
  score: number;
  notes: string[];
};
