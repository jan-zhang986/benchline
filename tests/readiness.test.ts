import assert from "node:assert/strict";
import test from "node:test";
import { brandMatches } from "../lib/brand.ts";
import { POINTS, buildFindings, totalScore, type CrawlEvidence } from "../lib/readiness.ts";
import {
  SEO_POINTS,
  SEO_POINT_TOTAL,
  buildSeoFindings,
  totalSeoScore,
} from "../lib/seo-readiness.ts";

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
  htmlLang: "en",
  ogTitle: "Acme — warehouse software",
  ogDescription: "Acme is warehouse software for mid-size teams that need a clear inventory count.",
  twitterCard: "summary_large_image",
  metaRobots: "",
  xRobotsTag: "",
  robotsState: "ok",
  robotsDetail: "ok",
  sitemaps: ["https://acme.example/sitemap.xml"],
  bots: {
    gptbot: "allowed",
    claudebot: "allowed",
    perplexitybot: "allowed",
    googleExtended: "allowed",
    googlebot: "allowed",
  },
  llmsState: "present",
  llmsDetail: "present",
};

test("a complete crawl scores GEO 100", () => {
  const findings = buildFindings("Acme", base);
  assert.equal(totalScore(findings), 100);
  assert.equal(
    Object.values(POINTS).reduce((sum, points) => sum + points, 0),
    100,
  );
  assert.ok(findings.every((finding) => finding.lane === "geo"));
});

test("a complete crawl scores SEO 100", () => {
  const findings = buildSeoFindings(base);
  assert.equal(totalSeoScore(findings), 100);
  assert.equal(SEO_POINT_TOTAL, 100);
  assert.ok(findings.every((finding) => finding.lane === "seo"));
});

test("dual findings keep GEO and SEO scores independent", () => {
  const findings = [...buildFindings("Acme", base), ...buildSeoFindings(base)];
  assert.equal(totalScore(findings), 100);
  assert.equal(totalSeoScore(findings), 100);
  assert.equal(findings.filter((finding) => finding.lane === "geo").length, 13);
  assert.equal(findings.filter((finding) => finding.lane === "seo").length, 11);
});

test("a blocked GPTBot drops only GEO points", () => {
  const findings = [
    ...buildFindings("Acme", {
      ...base,
      bots: { ...base.bots, gptbot: "blocked" },
    }),
    ...buildSeoFindings({
      ...base,
      bots: { ...base.bots, gptbot: "blocked" },
    }),
  ];
  assert.equal(totalScore(findings), 100 - POINTS.gptbot);
  assert.equal(totalSeoScore(findings), 100);
  assert.equal(findings.find((finding) => finding.id === "gptbot")?.status, "fail");
});

test("a blocked Googlebot drops only SEO points", () => {
  const evidence = {
    ...base,
    bots: { ...base.bots, googlebot: "blocked" as const },
  };
  const findings = [...buildFindings("Acme", evidence), ...buildSeoFindings(evidence)];
  assert.equal(totalScore(findings), 100);
  assert.equal(totalSeoScore(findings), 100 - SEO_POINTS.googlebot);
  assert.equal(findings.find((finding) => finding.id === "seo-googlebot")?.status, "fail");
});

test("noindex fails the SEO indexable check", () => {
  const findings = buildSeoFindings({
    ...base,
    metaRobots: "noindex, follow",
  });
  assert.equal(findings.find((finding) => finding.id === "seo-indexable")?.status, "fail");
  assert.equal(totalSeoScore(findings), 100 - SEO_POINTS.indexable);
});

test("X-Robots-Tag noindex also fails indexable", () => {
  const findings = buildSeoFindings({
    ...base,
    xRobotsTag: "noindex",
  });
  assert.equal(findings.find((finding) => finding.id === "seo-indexable")?.status, "fail");
});

test("missing sitemap and OG basics fail SEO only", () => {
  const findings = buildSeoFindings({
    ...base,
    sitemaps: [],
    ogTitle: "",
    ogDescription: "",
  });
  assert.equal(findings.find((finding) => finding.id === "seo-sitemap")?.status, "fail");
  assert.equal(findings.find((finding) => finding.id === "seo-og-basics")?.status, "fail");
  assert.equal(
    totalSeoScore(findings),
    100 - SEO_POINTS.sitemap - SEO_POINTS.ogBasics,
  );
});

test("title-present passes without brand match while GEO title can fail", () => {
  const evidence = {
    ...base,
    title: "Warehouse software for operators",
    h1: "Warehouse software for operators",
  };
  const geo = buildFindings("Acme", evidence);
  const seo = buildSeoFindings(evidence);
  assert.equal(geo.find((finding) => finding.id === "title")?.status, "fail");
  assert.equal(seo.find((finding) => finding.id === "seo-title-present")?.status, "pass");
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
