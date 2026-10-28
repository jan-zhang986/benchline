import assert from "node:assert/strict";
import test from "node:test";
import { parsePage } from "../lib/html-signals.ts";

test("reads title, H1, description, canonical, and JSON-LD types", () => {
  const html = `<!doctype html><html><head>
<title>Acme — warehouse</title>
<meta name="description" content="Acme is warehouse software for operators who count inventory.">
<link rel="canonical" href="https://acme.example/">
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
  for (const type of ["Organization", "WebSite", "Thing", "FAQPage", "Corporation"]) {
    assert.ok(page.schemaTypes.includes(type), type);
  }
});
