"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { crawlSite } from "@/lib/crawl";
import { DEFAULT_CATEGORY, renderPromptPack } from "@/lib/prompt-pack";
import { consumeRateLimit, clientIpFromHeaders } from "@/lib/rate-limit";
import { buildFindings, buildFixes, totalScore } from "@/lib/readiness";
import { maybeLiveChecks } from "@/lib/live-check";
import { saveReport, saveWaitlist } from "@/lib/reports";
import { assertPublicHttpUrl } from "@/lib/ssrf";
import { cleanText } from "@/lib/text";
import { verifyTurnstile } from "@/lib/turnstile";

export type ActionError = { error: string };
export type WaitlistState = { ok: true } | { error: string } | null;

function rethrowNext(error: unknown): void {
  if (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_")
  ) {
    throw error;
  }
}

export async function createReport(
  _previous: ActionError | null,
  formData: FormData,
): Promise<ActionError | null> {
  try {
    const honeypot = String(formData.get("benchline_hp") ?? "");
    if (honeypot.trim()) return { error: "Could not submit that form." };

    const brand = cleanText(String(formData.get("brand") ?? ""), 80);
    const websiteRaw = cleanText(String(formData.get("website") ?? ""), 300);
    const categoryRaw = cleanText(String(formData.get("category") ?? ""), 60);
    const category = categoryRaw.length > 0 ? categoryRaw : null;

    if (brand.length < 2) return { error: "Enter a brand name of at least 2 characters." };
    if (!/[0-9A-Za-z]/.test(brand)) {
      return { error: "The brand name needs at least one letter or number." };
    }
    if (!websiteRaw) return { error: "Enter the brand website." };

    const headerList = await headers();
    const ip = clientIpFromHeaders(headerList);
    const limit = await consumeRateLimit(ip, "check");
    if (!limit.ok) return { error: limit.error };

    const token = String(formData.get("cf-turnstile-response") ?? "");
    const turnstile = await verifyTurnstile(token || null, ip);
    if (!turnstile.ok) return { error: turnstile.error };

    const checked = await assertPublicHttpUrl(websiteRaw);
    if (!checked.ok) return { error: checked.error };

    const evidence = await crawlSite(checked.url);
    const findings = buildFindings(brand, evidence);
    const prompts = renderPromptPack(brand, category);
    const live = await maybeLiveChecks({
      brand,
      website: checked.url.toString(),
      category,
    });
    const id = await saveReport({
      brand,
      website: checked.url.toString(),
      finalUrl: evidence.finalUrl,
      category,
      categoryUsed: category ?? DEFAULT_CATEGORY,
      categoryDefaulted: category == null,
      score: totalScore(findings),
      findings,
      prompts,
      fixes: buildFixes(findings),
      live,
    });
    redirect(`/r/${id}`);
  } catch (error) {
    rethrowNext(error);
    console.error("createReport failed");
    return { error: "The check could not be saved. Try again in a moment." };
  }
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function joinWaitlist(
  _previous: WaitlistState,
  formData: FormData,
): Promise<WaitlistState> {
  try {
    const honeypot = String(formData.get("benchline_hp") ?? "");
    if (honeypot.trim()) return { error: "Could not submit that form." };

    const email = cleanText(String(formData.get("email") ?? ""), 200).toLowerCase();
    const brandRaw = cleanText(String(formData.get("brand") ?? ""), 80);
    const sourceRaw = cleanText(String(formData.get("source") ?? ""), 80);
    if (!EMAIL.test(email)) return { error: "Enter a valid email address." };

    const headerList = await headers();
    const limit = await consumeRateLimit(clientIpFromHeaders(headerList), "waitlist");
    if (!limit.ok) return { error: limit.error };

    const source = sourceRaw.startsWith("/") ? sourceRaw : "/";
    await saveWaitlist({
      email,
      brand: brandRaw || null,
      source,
    });
    return { ok: true };
  } catch (error) {
    rethrowNext(error);
    console.error("joinWaitlist failed");
    return { error: "Could not save that address. Try again in a moment." };
  }
}
