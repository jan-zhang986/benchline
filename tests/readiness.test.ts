import assert from "node:assert/strict";
import test from "node:test";
import { brandMatches } from "../lib/brand.ts";
import { POINTS, buildFindings, totalScore, type CrawlEvidence } from "../lib/readiness.ts";

const base: CrawlEvidence = {
  submittedUrl: "https://acme.example",
  finalUrl: "https://acme.example/",
  homepageOk: true,
  homepageError: null,
  title: "Acme — warehouse software",
  h1: "Acme for operators",
  description: "Acme is warehouse software for mid-size teams that need a clear inventory count.",
  canonical: "https://acme.example/",
  schemaTypes: ["Organization", "WebSite", "FAQPage"],
  robotsState: "ok",
  robotsDetail: "ok",
  bots: {
    gptbot: "allowed",
    claudebot: "allowed",
    perplexitybot: "allowed",
    googleExtended: "allowed",
  },
  llmsState: "present",
  llmsDetail: "present",
};

test("a complete crawl scores 100", () => {
  const findings = buildFindings("Acme", base);
  assert.equal(totalScore(findings), 100);
  assert.equal(
    Object.values(POINTS).reduce((sum, points) => sum + points, 0),
    100,
  );
});

test("a blocked GPTBot drops only those points", () => {
  const findings = buildFindings("Acme", {
    ...base,
    bots: { ...base.bots, gptbot: "blocked" },
  });
  assert.equal(totalScore(findings), 100 - POINTS.gptbot);
  assert.equal(findings.find((finding) => finding.id === "gptbot")?.status, "fail");
});

test("a failed homepage marks on-page checks unknown", () => {
  const findings = buildFindings("Acme", {
    ...base,
    homepageOk: false,
    homepageError: "The request timed out.",
    finalUrl: null,
    schemaTypes: [],
  });
  const title = findings.find((finding) => finding.id === "title");
  assert.equal(title?.status, "unknown");
  assert.equal(title?.points, 0);
  assert.equal(findings.find((finding) => finding.id === "llms")?.status, "pass");
});

test("brand matching ignores short tokens inside other words", () => {
  assert.equal(brandMatches("AI", "Email tools for teams"), false);
  assert.equal(brandMatches("AI", "An AI helper for teams"), true);
  assert.equal(brandMatches("Acme Analytics", "Welcome to Acme"), true);
  assert.equal(brandMatches("Stripe", "Payment processing"), false);
});
