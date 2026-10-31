import assert from "node:assert/strict";
import test from "node:test";
import { accessFor, parseRobots, parseRobotsDocument } from "../lib/robots-parse.ts";

test("specific GPTBot disallow beats a wildcard allow", () => {
  const groups = parseRobots(`
User-agent: GPTBot
Disallow: /

User-agent: *
Allow: /
`);
  assert.equal(accessFor(groups, "GPTBot"), "blocked");
  assert.equal(accessFor(groups, "ClaudeBot"), "allowed");
});

test("equal-length allow wins over disallow", () => {
  const groups = parseRobots(`
User-agent: PerplexityBot
Disallow: /
Allow: /
`);
  assert.equal(accessFor(groups, "perplexitybot"), "allowed");
});

test("empty disallow does not block", () => {
  const groups = parseRobots(`
User-agent: Google-Extended
Disallow:
`);
  assert.equal(accessFor(groups, "google-extended"), "allowed");
});

test("wildcard disallow blocks agents with no group of their own", () => {
  const groups = parseRobots(`
User-agent: *
Disallow: /
`);
  assert.equal(accessFor(groups, "ClaudeBot"), "blocked");
});

test("a private path disallow does not block the homepage", () => {
  const groups = parseRobots(`
User-agent: *
Disallow: /admin
Allow: /
`);
  assert.equal(accessFor(groups, "GPTBot", "/"), "allowed");
});

test("parses Sitemap directives without duplicating", () => {
  const parsed = parseRobotsDocument(`
User-agent: *
Allow: /

Sitemap: https://acme.example/sitemap.xml
Sitemap: https://acme.example/sitemap.xml
Sitemap: https://acme.example/news.xml
`);
  assert.deepEqual(parsed.sitemaps, [
    "https://acme.example/sitemap.xml",
    "https://acme.example/news.xml",
  ]);
  assert.equal(accessFor(parsed.groups, "Googlebot"), "allowed");
});
