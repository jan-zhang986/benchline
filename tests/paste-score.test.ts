import assert from "node:assert/strict";
import test from "node:test";
import { scorePastedAnswer } from "../lib/paste-score.ts";

const answer = `Acme is often compared with other warehouse tools.

1. Acme — the one in the question
2. Northwind — strong for warehouses
3. Contoso — lighter setup

Acme vs Northwind comes up a lot. Alternatives include Fabrikam and Litware.
`;

test("scores a list mention and extracts neighboring names", () => {
  const result = scorePastedAnswer({
    brand: "Acme",
    answer,
    website: "https://acme.example",
  });
  assert.equal(result.mentioned, true);
  assert.equal(result.listRank, 1);
  assert.equal(result.listSize, 3);
  assert.equal(result.positionLabel, "early");
  assert.ok(result.score > 50);
  const names = result.competitors.map((item) => item.name);
  assert.ok(names.includes("Northwind"));
  assert.ok(names.includes("Contoso"));
  assert.ok(names.includes("Fabrikam"));
  assert.ok(names.includes("Litware"));
  assert.equal(names.includes("Acme"), false);
});

test("returns zero when the brand is absent", () => {
  const result = scorePastedAnswer({
    brand: "Acme",
    answer: "This reply talks about logistics software in general and names nobody.",
  });
  assert.equal(result.mentioned, false);
  assert.equal(result.score, 0);
});

test("does not treat a short brand as a substring", () => {
  const result = scorePastedAnswer({
    brand: "AI",
    answer: "Email marketing software is a crowded category.",
  });
  assert.equal(result.mentioned, false);
});

test("matches a supplied competitor only when it appears", () => {
  const result = scorePastedAnswer({
    brand: "Acme",
    answer: "People also look at Initech when they outgrow spreadsheets. Acme is mentioned once.",
    competitors: ["Initech", "AbsentCo"],
  });
  const names = result.competitors.map((item) => item.name);
  assert.ok(names.includes("Initech"));
  assert.equal(names.includes("AbsentCo"), false);
});
