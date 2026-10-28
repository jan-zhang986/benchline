"use client";

import { useMemo, useState } from "react";
import { scorePastedAnswer } from "@/lib/paste-score";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const POSITION: Record<string, string> = {
  "not mentioned": "Not mentioned",
  early: "Early in the answer",
  middle: "Middle of the answer",
  late: "Late in the answer",
};

export function PasteScorer({
  brand,
  website,
}: {
  brand: string;
  website: string;
}) {
  const [answer, setAnswer] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const result = useMemo(() => {
    if (submitted == null) return null;
    return scorePastedAnswer({
      brand,
      website,
      answer: submitted,
      competitors: competitors
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean)
        .slice(0, 12),
    });
  }, [brand, website, submitted, competitors]);

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="pasted-answer">Pasted answer</Label>
        <Textarea
          id="pasted-answer"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          placeholder="Paste the full ChatGPT, Perplexity, Gemini, or Claude reply here."
          className="min-h-40 bg-card text-base md:text-base"
          maxLength={20000}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="known-competitors">Competitor names, optional</Label>
        <Input
          id="known-competitors"
          value={competitors}
          onChange={(event) => setCompetitors(event.target.value)}
          placeholder="Northwind, Contoso"
          className="h-11 bg-card px-3 text-base md:text-base"
        />
        <p className="text-xs text-muted-foreground">
          Comma-separated names to look for. We also guess names from lists and “vs” phrases. Guesses
          can be wrong.
        </p>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <Button
        type="button"
        className="h-11 px-4"
        onClick={() => {
          if (answer.trim().length < 10) {
            setError("Paste a fuller answer. A few words is not enough to score.");
            setSubmitted(null);
            return;
          }
          setError(null);
          setSubmitted(answer);
        }}
      >
        Score this answer
      </Button>
      <p className="text-xs leading-relaxed text-muted-foreground">
        Scoring runs in your browser. The answer is not uploaded. The number is a reading of this
        text only, not a live rank.
      </p>
      {result ? (
        <div className="rounded-xl border border-border bg-card p-4" aria-live="polite">
          <p className="font-heading text-4xl tracking-tight">
            {result.score}
            <span className="text-xl text-muted-foreground">/100</span>
          </p>
          <p className="mt-1 text-sm font-medium">Paste mention score</p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Mention</dt>
              <dd>{result.mentioned ? `Yes, ${result.mentionCount} time${result.mentionCount === 1 ? "" : "s"}` : "No"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Position</dt>
              <dd>
                {POSITION[result.positionLabel]}
                {result.positionPercent !== null ? ` (${result.positionPercent}% through the text)` : ""}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">List rank</dt>
              <dd>
                {result.listRank
                  ? `Item ${result.listRank} of ${result.listSize}`
                  : "Not found in a list"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Matched on</dt>
              <dd>{result.matchedOn === "domain" ? "Domain label" : result.matchedOn === "brand" ? "Brand name" : "—"}</dd>
            </div>
          </dl>
          <div className="mt-4">
            <p className="text-sm font-medium">Possible named competitors</p>
            {result.competitors.length === 0 ? (
              <p className="mt-1 text-sm text-muted-foreground">None detected in this text.</p>
            ) : (
              <ul className="mt-2 space-y-1 text-sm">
                {result.competitors.map((competitor) => (
                  <li key={competitor.name}>
                    <span className="font-medium">{competitor.name}</span>
                    <span className="text-muted-foreground"> — {competitor.evidence}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
            {result.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
