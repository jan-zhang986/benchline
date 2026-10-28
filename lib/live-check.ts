import { createHash } from "node:crypto";
import { execute } from "@/lib/db";
import { scorePastedAnswer } from "@/lib/paste-score";
import type { LiveCheck, LiveProvider } from "@/lib/types";

export const LIVE_DISCLAIMER =
  "If a reply is shown, it came from a provider API. It is not the consumer ChatGPT, Claude, Perplexity, or Gemini app. Models, browsing, memory, and location differ. Benchline does not treat an API reply as a rank, and it never promises a number-one placement.";

const PROVIDER_LABEL: Record<LiveProvider, string> = {
  dataforseo: "DataForSEO ChatGPT LLM Responses",
  openai: "OpenAI API",
  brave: "Brave AI Answers",
};

function quotaCap(): number {
  const parsed = Number(process.env.LIVE_CHECK_DAILY_QUOTA ?? "15");
  if (!Number.isFinite(parsed) || parsed < 0) return 15;
  return Math.floor(parsed);
}

export function livePrompt(brand: string, website: string, category: string | null): string {
  const categoryBit = category ? ` Category: ${category}.` : "";
  const prompt = `What is ${brand}? The site to consider is ${website}.${categoryBit} Answer in under 160 words. Name the brand if you know it, and name up to three alternatives a buyer might compare. If you do not know it, say so.`;
  return prompt.slice(0, 500);
}

function configuredProviders(): LiveProvider[] {
  if (process.env.LIVE_CHECKS === "off") return [];
  const providers: LiveProvider[] = [];
  if (process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD) providers.push("dataforseo");
  if (process.env.OPENAI_API_KEY) providers.push("openai");
  if (process.env.BRAVE_API_KEY || process.env.BRAVE_SEARCH_API_KEY) providers.push("brave");
  return providers.slice(0, 3);
}

function skipped(detail: string): LiveCheck {
  return {
    status: "skipped",
    provider: null,
    providerLabel: "Live engine check",
    prompt: null,
    answer: null,
    mentioned: null,
    mentionScore: null,
    detail,
    cached: false,
    disclaimer: LIVE_DISCLAIMER,
  };
}

function cacheKey(provider: LiveProvider, prompt: string): string {
  return createHash("sha256").update(`${provider}|${prompt}`).digest("hex");
}

async function readCache(provider: LiveProvider, prompt: string): Promise<LiveCheck | null> {
  const now = new Date().toISOString();
  const result = await execute(
    `SELECT payload_json FROM live_cache WHERE cache_key = ? AND expires_at > ?`,
    [cacheKey(provider, prompt), now],
  );
  const payload = result.rows[0]?.payload_json;
  if (typeof payload !== "string") return null;
  try {
    const parsed = JSON.parse(payload) as LiveCheck;
    return { ...parsed, cached: true };
  } catch {
    return null;
  }
}

async function writeCache(provider: LiveProvider, prompt: string, check: LiveCheck): Promise<void> {
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await execute(
    `INSERT INTO live_cache (cache_key, payload_json, created_at, expires_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(cache_key) DO UPDATE SET payload_json = excluded.payload_json, created_at = excluded.created_at, expires_at = excluded.expires_at`,
    [cacheKey(provider, prompt), JSON.stringify({ ...check, cached: false }), createdAt, expiresAt],
  );
}

async function takeQuota(): Promise<boolean> {
  const day = new Date().toISOString().slice(0, 10);
  const result = await execute(
    `INSERT INTO live_quota (day, count) VALUES (?, 1)
     ON CONFLICT(day) DO UPDATE SET count = count + 1
     RETURNING count`,
    [day],
  );
  return Number(result.rows[0]?.count ?? 1) <= quotaCap();
}

function clipError(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, 180);
}

async function postJson(
  url: string,
  headers: Record<string, string>,
  body: unknown,
): Promise<{ ok: true; json: unknown } | { ok: false; error: string }> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(12_000),
    });
    const json = (await response.json().catch(() => null)) as unknown;
    if (!response.ok) {
      const message =
        json && typeof json === "object" && "error" in json
          ? JSON.stringify((json as { error: unknown }).error)
          : `HTTP ${response.status}`;
      return { ok: false, error: clipError(message) };
    }
    return { ok: true, json };
  } catch (error) {
    const timedOut = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    return { ok: false, error: timedOut ? "The live call timed out." : "The live call failed." };
  }
}

function chatText(json: unknown): string | null {
  if (!json || typeof json !== "object") return null;
  const choices = (json as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || !choices[0] || typeof choices[0] !== "object") return null;
  const message = (choices[0] as { message?: { content?: unknown } }).message;
  return typeof message?.content === "string" ? message.content.trim() : null;
}

function dataForSeoText(json: unknown): string | null {
  if (!json || typeof json !== "object") return null;
  const tasks = (json as { tasks?: unknown }).tasks;
  if (!Array.isArray(tasks) || !tasks[0] || typeof tasks[0] !== "object") return null;
  const task = tasks[0] as { status_code?: number; result?: unknown };
  if (task.status_code && task.status_code !== 20000) return null;
  const result = Array.isArray(task.result) ? task.result[0] : null;
  if (!result || typeof result !== "object") return null;
  const items = (result as { items?: unknown }).items;
  if (!Array.isArray(items)) return null;
  const chunks: string[] = [];
  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    if ((item as { type?: string }).type !== "message") continue;
    const sections = (item as { sections?: unknown }).sections;
    if (!Array.isArray(sections)) continue;
    for (const section of sections) {
      if (section && typeof section === "object" && typeof (section as { text?: unknown }).text === "string") {
        chunks.push((section as { text: string }).text);
      }
    }
  }
  const text = chunks.join("\n\n").trim();
  return text || null;
}

function withMention(provider: LiveProvider, prompt: string, answer: string, brand: string, website: string): LiveCheck {
  const paste = scorePastedAnswer({ brand, answer, website });
  return {
    status: "ok",
    provider,
    providerLabel: PROVIDER_LABEL[provider],
    prompt,
    answer: answer.slice(0, 1500),
    mentioned: paste.mentioned,
    mentionScore: paste.score,
    detail: paste.mentioned
      ? `The brand string appears in this API reply. Paste score ${paste.score}/100 on that text only.`
      : "The brand string does not appear in this API reply.",
    cached: false,
    disclaimer: LIVE_DISCLAIMER,
  };
}

async function callProvider(
  provider: LiveProvider,
  prompt: string,
  brand: string,
  website: string,
): Promise<LiveCheck> {
  if (provider === "openai") {
    const result = await postJson(
      "https://api.openai.com/v1/chat/completions",
      { authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      {
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.2,
        max_tokens: 350,
        messages: [
          {
            role: "system",
            content:
              "Answer briefly. If you do not know the brand, say so. Do not invent a ranking or a market share.",
          },
          { role: "user", content: prompt },
        ],
      },
    );
    if (!result.ok) {
      return failed(provider, prompt, result.error);
    }
    const text = chatText(result.json);
    if (!text) return failed(provider, prompt, "The API returned no answer text.");
    return withMention(provider, prompt, text, brand, website);
  }

  if (provider === "brave") {
    const key = process.env.BRAVE_API_KEY || process.env.BRAVE_SEARCH_API_KEY || "";
    const result = await postJson(
      "https://api.search.brave.com/res/v1/chat/completions",
      { "x-subscription-token": key },
      {
        model: "brave",
        stream: false,
        max_completion_tokens: 400,
        messages: [{ role: "user", content: prompt }],
      },
    );
    if (!result.ok) return failed(provider, prompt, result.error);
    const text = chatText(result.json);
    if (!text) return failed(provider, prompt, "Brave returned no answer text.");
    return withMention(provider, prompt, text, brand, website);
  }

  const login = process.env.DATAFORSEO_LOGIN ?? "";
  const password = process.env.DATAFORSEO_PASSWORD ?? "";
  const credentials = Buffer.from(`${login}:${password}`).toString("base64");
  const result = await postJson(
    "https://api.dataforseo.com/v3/ai_optimization/chat_gpt/llm_responses/live",
    { authorization: `Basic ${credentials}` },
    [
      {
        user_prompt: prompt,
        model_name: process.env.DATAFORSEO_MODEL || "gpt-4.1-mini",
        max_output_tokens: 400,
        temperature: 0.2,
        web_search: process.env.DATAFORSEO_WEB_SEARCH === "true",
      },
    ],
  );
  if (!result.ok) return failed(provider, prompt, result.error);
  const text = dataForSeoText(result.json);
  if (!text) return failed(provider, prompt, "DataForSEO returned no answer text.");
  return withMention(provider, prompt, text, brand, website);
}

function failed(provider: LiveProvider, prompt: string, error: string): LiveCheck {
  return {
    status: "error",
    provider,
    providerLabel: PROVIDER_LABEL[provider],
    prompt,
    answer: null,
    mentioned: null,
    mentionScore: null,
    detail: `Live check failed: ${error} The citability score does not depend on this call.`,
    cached: false,
    disclaimer: LIVE_DISCLAIMER,
  };
}

function quotaResult(provider: LiveProvider, prompt: string): LiveCheck {
  return {
    status: "quota",
    provider,
    providerLabel: PROVIDER_LABEL[provider],
    prompt,
    answer: null,
    mentioned: null,
    mentionScore: null,
    detail: `Daily live-check quota (${quotaCap()}) is used up. Citability, prompts, and paste scoring still run.`,
    cached: false,
    disclaimer: LIVE_DISCLAIMER,
  };
}

export async function maybeLiveChecks(input: {
  brand: string;
  website: string;
  category: string | null;
}): Promise<LiveCheck[]> {
  const providers = configuredProviders();
  if (providers.length === 0) {
    return [
      skipped(
        "No DataForSEO, OpenAI, or Brave key is configured. Citability, the prompt pack, and paste scoring do not need one.",
      ),
    ];
  }

  const prompt = livePrompt(input.brand, input.website, input.category);
  const checks: LiveCheck[] = [];
  for (const provider of providers) {
    const cached = await readCache(provider, prompt);
    if (cached) {
      checks.push(cached);
      continue;
    }
    const allowed = await takeQuota();
    if (!allowed) {
      checks.push(quotaResult(provider, prompt));
      continue;
    }
    const check = await callProvider(provider, prompt, input.brand, input.website);
    if (check.status === "ok") await writeCache(provider, prompt, check);
    checks.push(check);
  }
  return checks;
}
