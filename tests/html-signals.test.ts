import assert from "node:assert/strict";
import test from "node:test";
import { hasNoindexDirective, parsePage } from "../lib/html-signals.ts";

test("reads title, H1, description, canonical, and JSON-LD types", () => {
  const html = `<!doctype html><html lang="en"><head>
<title>Acme — warehouse</title>
<meta name="description" content="Acme is warehouse software for operators who count inventory.">
<link rel="canonical" href="https://acme.example/">
<meta property="og:title" content="Acme OG">
<meta property="og:description" content="Acme OG description for sharing.">
<meta name="twitter:card" content="summary">
<meta name="robots" content="index,follow">
<script type="application/ld+json">
{"@context":"https://schema.org","@graph":[
  {"@type":"Organization","name":"Acme"},
  {"@type":["WebSite","Thing"],"name":"Acme"},
  {"@type":"FAQPage","mainEntity":[]}
]}
</script>
</head><body><h1>Acme for operators</h1>
<div itemtype="https://schema.org/Corporation"></div>
</body></html>`;
  const page = parsePage(html);
  assert.equal(page.title, "Acme — warehouse");
  assert.equal(page.h1, "Acme for operators");
  assert.match(page.description, /warehouse software/);
  assert.equal(page.canonical, "https://acme.example/");
  assert.equal(page.htmlLang, "en");
  assert.equal(page.ogTitle, "Acme OG");
  assert.equal(page.ogDescription, "Acme OG description for sharing.");
  assert.equal(page.twitterCard, "summary");
  assert.match(page.metaRobots, /index/);
  for (const type of ["Organization", "WebSite", "Thing", "FAQPage", "Corporation"]) {
    assert.ok(page.schemaTypes.includes(type), type);
  }
});

test("hasNoindexDirective detects noindex and none", () => {
  assert.equal(hasNoindexDirective("index, follow"), false);
  assert.equal(hasNoindexDirective("noindex, follow"), true);
  assert.equal(hasNoindexDirective("", "none"), true);
  assert.equal(hasNoindexDirective("max-snippet:0"), false);
});
